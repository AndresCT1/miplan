import { getByOperator, getCompare, getFeatured }     from '../db/queries/plans.js'
import { recordView, getTodayDistributedCount }        from '../db/queries/planViews.js'
import { respond }                                      from '../utils/respond.js'

export async function getPlansByOperator(req, res, next) {
  try {
    const operatorId = parseInt(req.params.operatorId, 10)
    if (!Number.isInteger(operatorId) || operatorId < 1) {
      return respond(res, 400, null, 'operatorId debe ser un entero positivo')
    }
    const plans = await getByOperator(operatorId)
    respond(res, 200, plans)
  } catch (err) {
    next(err)
  }
}

export async function comparePlans(req, res, next) {
  try {
    const raw = req.query.ids
    if (!raw) return respond(res, 400, null, 'El parámetro ids es requerido')

    const ids = String(raw)
      .split(',')
      .map((s) => parseInt(s.trim(), 10))

    if (ids.some((id) => !Number.isInteger(id) || id < 1)) {
      return respond(res, 400, null, 'ids debe ser una lista de enteros positivos separados por coma')
    }
    if (ids.length < 2 || ids.length > 4) {
      return respond(res, 400, null, 'Debes comparar entre 2 y 4 planes')
    }

    const plans = await getCompare(ids)
    respond(res, 200, plans)
  } catch (err) {
    next(err)
  }
}

export async function getFeaturedPlans(req, res, next) {
  try {
    const plans = await getFeatured()
    respond(res, 200, plans)
  } catch (err) {
    next(err)
  }
}

export async function registerPlanView(req, res, next) {
  try {
    const planId = parseInt(req.params.id, 10)
    if (!Number.isInteger(planId) || planId < 1) {
      return respond(res, 400, null, 'planId debe ser un entero positivo')
    }
    await recordView(planId)
    respond(res, 200, { recorded: true })
  } catch (err) {
    next(err)
  }
}

export async function getPlanViewsToday(req, res, next) {
  try {
    const planId = parseInt(req.params.id, 10)
    if (!Number.isInteger(planId) || planId < 1) {
      return respond(res, 400, null, 'planId debe ser un entero positivo')
    }
    const count = await getTodayDistributedCount(planId)
    respond(res, 200, { count })
  } catch (err) {
    next(err)
  }
}
