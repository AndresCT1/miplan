import bcrypt from 'bcryptjs'
import jwt    from 'jsonwebtoken'
import {
  getAdminByEmail,
  getLeads,
  updateLeadStatus as dbUpdateStatus,
  getStats,
} from '../db/queries/admin.js'
import { respond } from '../utils/respond.js'

const VALID_STATUSES = ['pending', 'contacted', 'interested', 'closed', 'lost']

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
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
