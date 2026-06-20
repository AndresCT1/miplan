import { getAllCommissions, upsertCommission } from '../db/queries/commissions.js'
import { respond } from '../utils/respond.js'

export async function getCommissions(req, res, next) {
  try {
    const data = await getAllCommissions()
    respond(res, 200, data)
  } catch (err) {
    next(err)
  }
}

export async function updateCommission(req, res, next) {
  try {
    const operatorId = parseInt(req.params.operatorId, 10)
    if (!Number.isInteger(operatorId) || operatorId < 1) {
      return respond(res, 400, null, 'ID de operador inválido')
    }

    const pct = parseFloat(req.body?.commission_pct)
    if (isNaN(pct) || pct < 0 || pct > 100) {
      return respond(res, 422, null, 'Comisión debe ser un número entre 0 y 100')
    }

    const rounded = Math.round(pct * 100) / 100
    const result  = await upsertCommission(operatorId, rounded)
    respond(res, 200, result)
  } catch (err) {
    next(err)
  }
}
