import { leadService } from '../services/leadService.js'
import { respond } from '../utils/respond.js'

export async function createLead(req, res, next) {
  try {
    const { dni, name, address, phone, operatorId, planId } = req.body
    const lead = await leadService.create({
      dni,
      name:       name.trim(),
      address:    address.trim(),
      phone,
      operatorId: parseInt(operatorId, 10),
      planId:     parseInt(planId, 10),
    })
    respond(res, 201, lead)
  } catch (err) {
    next(err)
  }
}
