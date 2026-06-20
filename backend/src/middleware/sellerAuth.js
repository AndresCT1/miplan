import jwt from 'jsonwebtoken'
import { respond } from '../utils/respond.js'

export function requireSellerAuth(req, res, next) {
  const token = req.cookies?.sellerToken
  if (!token) return respond(res, 401, null, 'No autorizado')
  try {
    req.seller = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'miplan-seller-api',
    })
    next()
  } catch {
    respond(res, 401, null, 'Sesión expirada')
  }
}
