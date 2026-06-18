import { getAll } from '../db/queries/operators.js'
import { respond } from '../utils/respond.js'

export async function getAllOperators(req, res, next) {
  try {
    const operators = await getAll()
    respond(res, 200, operators)
  } catch (err) {
    next(err)
  }
}
