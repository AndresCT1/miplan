import {
  createClient,
  getClientsBySeller,
  getClientStats,
  updateClientNotes,
  getPaidClients,
} from '../db/queries/sellerClients.js'
import { getCommissionByOperator } from '../db/queries/commissions.js'
import { pool } from '../db/connection.js'
import { respond } from '../utils/respond.js'

export async function handleGetClients(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const result = await getClientsBySeller(req.seller.sellerId, {
      status, page: parseInt(page), limit: parseInt(limit),
    })
    respond(res, 200, result)
  } catch (err) { next(err) }
}

export async function handleCreateClient(req, res, next) {
  try {
    const {
      clientName, clientPhone, operatorId, planId,
      regularPrice, commissionPct, installationDate, notes,
    } = req.body ?? {}

    if (!clientName?.trim())  return respond(res, 422, null, 'Nombre del cliente requerido')
    if (!operatorId)          return respond(res, 422, null, 'Operador requerido')
    if (!installationDate)    return respond(res, 422, null, 'Fecha de instalación requerida')
    if (regularPrice == null || isNaN(parseFloat(regularPrice)))
      return respond(res, 422, null, 'Precio regular requerido')

    const opId = parseInt(operatorId)
    // Resolve commission pct: use provided value or fetch from operator config
    let pct = commissionPct != null ? parseFloat(commissionPct) : null
    if (pct == null) pct = await getCommissionByOperator(opId)

    const client = await createClient({
      sellerId:         req.seller.sellerId,
      clientName:       clientName.trim(),
      clientPhone:      clientPhone || null,
      operatorId:       opId,
      planId:           planId ? parseInt(planId) : null,
      regularPrice:     parseFloat(regularPrice),
      commissionPct:    pct,
      installationDate,
      notes,
    })
    respond(res, 201, client)
  } catch (err) { next(err) }
}

export async function handleGetClientStats(req, res, next) {
  try {
    const stats = await getClientStats(req.seller.sellerId)
    respond(res, 200, stats)
  } catch (err) { next(err) }
}

export async function handleUpdateClientNotes(req, res, next) {
  try {
    const id = parseInt(req.params.id)
    if (!Number.isInteger(id) || id < 1) return respond(res, 400, null, 'ID inválido')
    const { notes } = req.body ?? {}
    const client = await updateClientNotes(id, req.seller.sellerId, notes ?? null)
    if (!client) return respond(res, 404, null, 'Cliente no encontrado')
    respond(res, 200, client)
  } catch (err) { next(err) }
}

export async function handleGetPayments(req, res, next) {
  try {
    const result = await getPaidClients(req.seller.sellerId)
    respond(res, 200, result)
  } catch (err) { next(err) }
}
