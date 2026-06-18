import jwt from 'jsonwebtoken'
import { respond } from '../utils/respond.js'

export function requireAuth(req, res, next) {
  const token = req.cookies?.adminToken
  if (!token) return respond(res, 401, null, 'No autorizado')
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'miplan-api',
    })
    next()
  } catch {
    respond(res, 401, null, 'Sesión expirada')
  }
}
