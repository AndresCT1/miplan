import { leadService } from '../services/leadService.js'
import { respond }      from '../utils/respond.js'

export async function createLead(req, res, next) {
  try {
    const { dni, name, address, phone, operatorId, planId } = req.body
    const lead = await leadService.create({
      dni:        dni?.trim()     || null,
      name:       name.trim(),
      address:    address?.trim() || null,
      phone,
      operatorId: operatorId ? parseInt(operatorId, 10) : null,
      planId:     planId     ? parseInt(planId, 10)     : null,
    })
    respond(res, 201, lead)
  } catch (err) {
    next(err)
  }
}
