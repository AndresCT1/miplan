import {
  createProspect,
  getProspectsBySeller,
  updateProspectStatus,
  updateProspectNextContact,
  incrementProspectAttempts,
  convertProspectToClient,
  getConversionStats,
  getProjection,
} from '../db/queries/sellerProspects.js'
import { getCommissionByOperator } from '../db/queries/commissions.js'
import { respond } from '../utils/respond.js'

const VALID_STATUSES = ['nuevo','contactado','interesado','propuesta','cerrado','perdido']

export async function handleGetProspects(req, res, next) {
  try {
    const { status, page = 1, limit = 50 } = req.query
    const result = await getProspectsBySeller(req.seller.sellerId, {
      status, page: parseInt(page), limit: parseInt(limit),
    })
    respond(res, 200, result)
  } catch (err) { next(err) }
}

export async function handleCreateProspect(req, res, next) {
  try {
    const { prospectName, prospectPhone, operatorId, planId,
            source, nextContactDate, notes } = req.body ?? {}

    if (!prospectName?.trim()) return respond(res, 422, null, 'Nombre del prospecto requerido')

    const prospect = await createProspect({
      sellerId:       req.seller.sellerId,
      prospectName:   prospectName.trim(),
      prospectPhone:  prospectPhone || null,
      operatorId:     operatorId ? parseInt(operatorId) : null,
      planId:         planId     ? parseInt(planId)     : null,
      source:         source || 'otro',
      nextContactDate: nextContactDate || null,
      notes:          notes || null,
    })
    respond(res, 201, prospect)
  } catch (err) { next(err) }
}

export async function handleUpdateProspectStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id)
    if (!Number.isInteger(id) || id < 1) return respond(res, 400, null, 'ID inválido')
    const { status } = req.body ?? {}
    if (!VALID_STATUSES.includes(status))
      return respond(res, 422, null, `Estado inválido. Valores: ${VALID_STATUSES.join(', ')}`)
    const prospect = await updateProspectStatus(id, req.seller.sellerId, status)
    if (!prospect) return respond(res, 404, null, 'Prospecto no encontrado')
    respond(res, 200, prospect)
  } catch (err) { next(err) }
}

export async function handleUpdateProspectNextContact(req, res, next) {
  try {
    const id = parseInt(req.params.id)
    if (!Number.isInteger(id) || id < 1) return respond(res, 400, null, 'ID inválido')
    const { date } = req.body ?? {}
    const prospect = await updateProspectNextContact(id, req.seller.sellerId, date || null)
    if (!prospect) return respond(res, 404, null, 'Prospecto no encontrado')
    respond(res, 200, prospect)
  } catch (err) { next(err) }
}

export async function handleIncrementAttempt(req, res, next) {
  try {
    const id = parseInt(req.params.id)
    if (!Number.isInteger(id) || id < 1) return respond(res, 400, null, 'ID inválido')
    const prospect = await incrementProspectAttempts(id, req.seller.sellerId)
    if (!prospect) return respond(res, 404, null, 'Prospecto no encontrado')
    respond(res, 200, prospect)
  } catch (err) { next(err) }
}

export async function handleConvertProspect(req, res, next) {
  try {
    const prospectId = parseInt(req.params.id)
    if (!Number.isInteger(prospectId) || prospectId < 1)
      return respond(res, 400, null, 'ID inválido')

    const { clientName, clientPhone, operatorId, planId,
            regularPrice, commissionPct, installationDate, notes } = req.body ?? {}

    if (!clientName?.trim())  return respond(res, 422, null, 'Nombre del cliente requerido')
    if (!installationDate)    return respond(res, 422, null, 'Fecha de instalación requerida')
    if (regularPrice == null) return respond(res, 422, null, 'Precio regular requerido')

    const opId = parseInt(operatorId)
    let pct = commissionPct != null ? parseFloat(commissionPct) : null
    if (pct == null && opId) pct = await getCommissionByOperator(opId)
    if (pct == null) pct = 0

    const result = await convertProspectToClient(prospectId, req.seller.sellerId, {
      clientName: clientName.trim(), clientPhone: clientPhone || null,
      operatorId: opId || null, planId: planId ? parseInt(planId) : null,
      regularPrice: parseFloat(regularPrice), commissionPct: pct,
      installationDate, notes: notes || null,
    })
    respond(res, 201, result)
  } catch (err) { next(err) }
}

export async function handleGetConversionStats(req, res, next) {
  try {
    const stats = await getConversionStats(req.seller.sellerId)
    respond(res, 200, stats)
  } catch (err) { next(err) }
}

export async function handleGetProjection(req, res, next) {
  try {
    const projection = await getProjection(req.seller.sellerId)
    respond(res, 200, projection)
  } catch (err) { next(err) }
}
