import bcrypt from 'bcryptjs'
import jwt    from 'jsonwebtoken'
import {
  getAdminByEmail,
  getLeads,
  updateLeadStatus as dbUpdateStatus,
  getStats,
} from '../db/queries/admin.js'
import {
  adminGetAllSellers,
  adminGetSellerByEmail,
  adminCreateSeller,
  adminUpdateSeller,
  adminResetSellerPassword,
  adminDeactivateSeller,
} from '../db/queries/sellers.js'
import {
  adminGetAllClients,
  adminMarkCommissionPaid,
} from '../db/queries/sellerClients.js'
import { getSellerForNotification } from '../db/queries/sellerProfile.js'
import { sellerNotificationService } from '../services/sellerNotificationService.js'
import { respond } from '../utils/respond.js'

const VALID_STATUSES = ['pending', 'contacted', 'interested', 'closed', 'lost']

const isProd = process.env.NODE_ENV === 'production'

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge:   8 * 60 * 60 * 1000, // 8 h
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function login(req, res, next) {
  try {
    const { email, password } = req.body ?? {}
    if (!email || !password) {
      return respond(res, 422, null, 'Email y password son requeridos')
    }

    const admin = await getAdminByEmail(email)
    if (!admin) return respond(res, 401, null, 'Credenciales incorrectas')

    const valid = await bcrypt.compare(password, admin.password_hash)
    if (!valid)  return respond(res, 401, null, 'Credenciales incorrectas')

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h', issuer: 'miplan-api' }
    )

    res.cookie('adminToken', token, COOKIE_OPTS)
    respond(res, 200, { email: admin.email })
  } catch (err) {
    next(err)
  }
}

export function logout(req, res) {
  res.clearCookie('adminToken', { ...COOKIE_OPTS, maxAge: 0 })
  respond(res, 200, { message: 'Sesión cerrada' })
}

export function getMe(req, res) {
  respond(res, 200, { email: req.admin.email, adminId: req.admin.adminId })
}

// ── Leads ─────────────────────────────────────────────────────────────────────
export async function adminGetLeads(req, res, next) {
  try {
    const { status, operatorId, page = 1, limit = 20 } = req.query
    const result = await getLeads({
      status,
      operatorId,
      page:  parseInt(page,  10),
      limit: parseInt(limit, 10),
    })
    respond(res, 200, result)
  } catch (err) {
    next(err)
  }
}

export async function adminUpdateLeadStatus(req, res, next) {
  try {
    const id     = parseInt(req.params.id, 10)
    const { status } = req.body ?? {}

    if (!Number.isInteger(id) || id < 1) {
      return respond(res, 400, null, 'ID inválido')
    }
    if (!VALID_STATUSES.includes(status)) {
      return respond(res, 422, null,
        `Status inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`)
    }

    const lead = await dbUpdateStatus(id, status)
    if (!lead) return respond(res, 404, null, 'Lead no encontrado')
    respond(res, 200, lead)
  } catch (err) {
    next(err)
  }
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export async function adminGetStats(req, res, next) {
  try {
    const stats = await getStats()
    respond(res, 200, stats)
  } catch (err) {
    next(err)
  }
}

// ── Seller management ─────────────────────────────────────────────────────────
export async function adminListSellers(req, res, next) {
  try {
    const sellers = await adminGetAllSellers()
    respond(res, 200, sellers)
  } catch (err) {
    next(err)
  }
}

export async function adminCreateSellerHandler(req, res, next) {
  try {
    const { name, email, password } = req.body ?? {}
    if (!name?.trim())           return respond(res, 422, null, 'El nombre es requerido')
    if (!email?.trim())          return respond(res, 422, null, 'El email es requerido')
    if (!password || password.length < 6)
      return respond(res, 422, null, 'La contraseña debe tener mínimo 6 caracteres')

    const existing = await adminGetSellerByEmail(email.trim().toLowerCase())
    if (existing) return respond(res, 409, null, 'Ya existe un vendedor con ese email')

    const passwordHash = await bcrypt.hash(password, 10)
    const seller = await adminCreateSeller({
      name:         name.trim(),
      email:        email.trim().toLowerCase(),
      passwordHash,
    })
    respond(res, 201, seller)
  } catch (err) {
    next(err)
  }
}

export async function adminUpdateSellerHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (!Number.isInteger(id) || id < 1) return respond(res, 400, null, 'ID inválido')

    const { name, email, active } = req.body ?? {}

    if (email !== undefined) {
      const conflict = await adminGetSellerByEmail(email.trim().toLowerCase())
      if (conflict && conflict.id !== id)
        return respond(res, 409, null, 'Ese email ya está en uso por otro vendedor')
    }

    const seller = await adminUpdateSeller(id, {
      name:   name   !== undefined ? name.trim()                    : undefined,
      email:  email  !== undefined ? email.trim().toLowerCase()     : undefined,
      active: active !== undefined ? Boolean(active)                : undefined,
    })
    if (!seller) return respond(res, 404, null, 'Vendedor no encontrado')
    respond(res, 200, seller)
  } catch (err) {
    next(err)
  }
}

export async function adminResetSellerPasswordHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (!Number.isInteger(id) || id < 1) return respond(res, 400, null, 'ID inválido')

    const { newPassword } = req.body ?? {}
    if (!newPassword || newPassword.length < 6)
      return respond(res, 422, null, 'La contraseña debe tener mínimo 6 caracteres')

    const passwordHash = await bcrypt.hash(newPassword, 10)
    const seller = await adminResetSellerPassword(id, passwordHash)
    if (!seller) return respond(res, 404, null, 'Vendedor no encontrado')
    respond(res, 200, { message: 'Contraseña actualizada correctamente' })
  } catch (err) {
    next(err)
  }
}

export async function adminDeactivateSellerHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (!Number.isInteger(id) || id < 1) return respond(res, 400, null, 'ID inválido')

    const seller = await adminDeactivateSeller(id)
    if (!seller) return respond(res, 404, null, 'Vendedor no encontrado')
    respond(res, 200, seller)
  } catch (err) {
    next(err)
  }
}

// ── Client commission management ──────────────────────────────────────────────
export async function adminListAllClients(req, res, next) {
  try {
    const { status, sellerId, page = 1, limit = 30 } = req.query
    const result = await adminGetAllClients({ status, sellerId, page: parseInt(page), limit: parseInt(limit) })
    respond(res, 200, result)
  } catch (err) { next(err) }
}

export async function adminMarkClientCommissionPaid(req, res, next) {
  try {
    const id = parseInt(req.params.id)
    if (!Number.isInteger(id) || id < 1) return respond(res, 400, null, 'ID inválido')

    const client = await adminMarkCommissionPaid(id)
    if (!client) return respond(res, 404, null, 'Cliente no encontrado o ya marcado como pagado')

    // Notificar al vendedor si tiene CallMeBot configurado
    const seller = await getSellerForNotification(client.seller_id)
    if (seller?.callmebot_apikey && seller?.phone) {
      sellerNotificationService.notifyCommissionPaid(seller, client).catch(() => {})
    }

    respond(res, 200, client)
  } catch (err) { next(err) }
}
