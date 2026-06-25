import bcrypt from 'bcryptjs'
import jwt    from 'jsonwebtoken'
import {
  getSellerByEmail,
  getSellerById,
  getSellerSales,
  getSellerDashboard,
  insertSale,
  updateSale,
  markContacted,
} from '../db/queries/sellers.js'
import { getSellerCatalog, getCommissionByOperator } from '../db/queries/commissions.js'
import { pool } from '../db/connection.js'
import { respond } from '../utils/respond.js'

const isProd = process.env.NODE_ENV === 'production'

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge:   8 * 60 * 60 * 1000, // 8 h
}

const VALID_STATUSES = ['pending', 'contacted', 'closed', 'lost']

function extractRegularPrice(features = []) {
  const feat = features.find(f => f.toLowerCase().startsWith('precio regular:'))
  if (!feat) return null
  const m = feat.match(/S\/([\d.]+)/)
  return m ? parseFloat(m[1]) : null
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function sellerLogin(req, res, next) {
  try {
    const { email, password } = req.body ?? {}
    if (!email || !password) {
      return respond(res, 422, null, 'Email y password son requeridos')
    }

    const seller = await getSellerByEmail(email)
    if (!seller) return respond(res, 401, null, 'Credenciales incorrectas')

    const valid = await bcrypt.compare(password, seller.password_hash)
    if (!valid)  return respond(res, 401, null, 'Credenciales incorrectas')

    const token = jwt.sign(
      { sellerId: seller.id, name: seller.name, email: seller.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h', issuer: 'miplan-seller-api' }
    )

    res.cookie('sellerToken', token, COOKIE_OPTS)
    respond(res, 200, { id: seller.id, name: seller.name, email: seller.email })
  } catch (err) {
    next(err)
  }
}

export function sellerLogout(req, res) {
  res.clearCookie('sellerToken', { ...COOKIE_OPTS, maxAge: 0 })
  respond(res, 200, { message: 'Sesión cerrada' })
}

export async function sellerGetMe(req, res, next) {
  try {
    const seller = await getSellerById(req.seller.sellerId)
    if (!seller) return respond(res, 401, null, 'Vendedor no encontrado')
    respond(res, 200, seller)
  } catch (err) {
    next(err)
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export async function sellerDashboard(req, res, next) {
  try {
    const data = await getSellerDashboard(req.seller.sellerId)
    respond(res, 200, data)
  } catch (err) {
    next(err)
  }
}

// ── Catalog ───────────────────────────────────────────────────────────────────
export async function sellerCatalog(req, res, next) {
  try {
    const catalog = await getSellerCatalog()
    respond(res, 200, catalog)
  } catch (err) {
    next(err)
  }
}

// ── Sales ─────────────────────────────────────────────────────────────────────
export async function sellerGetSales(req, res, next) {
  try {
    const { status, month, page = 1, limit = 20 } = req.query
    const { sales, total } = await getSellerSales({
      sellerId: req.seller.sellerId,
      status,
      month,
      page:  parseInt(page,  10),
      limit: parseInt(limit, 10),
    })
    respond(res, 200, { sales, total, page: parseInt(page, 10) })
  } catch (err) {
    next(err)
  }
}

export async function sellerCreateSale(req, res, next) {
  try {
    const {
      clientName, clientPhone, operatorId, planId, followUpDate, notes
    } = req.body ?? {}

    if (!clientName?.trim() || !clientPhone || !operatorId || !planId) {
      return respond(res, 422, null, 'Faltan campos obligatorios')
    }
    if (!/^9\d{8}$/.test(clientPhone)) {
      return respond(res, 422, null, 'Celular inválido (debe empezar con 9 y tener 9 dígitos)')
    }

    const opId = parseInt(operatorId, 10)
    const plId = parseInt(planId, 10)
    if (!opId || !plId) return respond(res, 422, null, 'Operador o plan inválido')

    const commissionPct  = await getCommissionByOperator(opId)
    const { rows: [plan] } = await pool.query(
      'SELECT price, features FROM plans WHERE id = $1 AND active = true', [plId]
    )
    if (!plan) return respond(res, 404, null, 'Plan no encontrado')

    const regularPrice   = extractRegularPrice(plan.features)
    const basePrice      = regularPrice ?? parseFloat(plan.price)
    const commissionAmount = Math.round(basePrice * (commissionPct / 100) * 100) / 100

    const sale = await insertSale({
      sellerId:         req.seller.sellerId,
      clientName:       clientName.trim(),
      clientPhone,
      operatorId:       opId,
      planId:           plId,
      commissionAmount,
      followUpDate:     followUpDate || null,
      notes:            notes || null,
    })

    respond(res, 201, { ...sale, commission_amount: commissionAmount })
  } catch (err) {
    next(err)
  }
}

export async function sellerUpdateSale(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (!Number.isInteger(id) || id < 1) {
      return respond(res, 400, null, 'ID inválido')
    }

    const { status, follow_up_date, notes } = req.body ?? {}

    if (status && !VALID_STATUSES.includes(status)) {
      return respond(res, 422, null, `Estado inválido. Valores: ${VALID_STATUSES.join(', ')}`)
    }

    const updated = await updateSale(id, req.seller.sellerId, {
      status, follow_up_date, notes
    })
    if (!updated) return respond(res, 404, null, 'Venta no encontrada')
    respond(res, 200, updated)
  } catch (err) {
    next(err)
  }
}

export async function sellerMarkContacted(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (!Number.isInteger(id) || id < 1) {
      return respond(res, 400, null, 'ID inválido')
    }

    const updated = await markContacted(id, req.seller.sellerId)
    if (!updated) return respond(res, 404, null, 'Venta no encontrada o ya contactada')
    respond(res, 200, updated)
  } catch (err) {
    next(err)
  }
}
