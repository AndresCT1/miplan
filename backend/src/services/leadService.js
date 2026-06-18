import { insertLead, getLeadWithDetails } from '../db/queries/leads.js'
import { telegramService } from './telegramService.js'

export const leadService = {
  async create(data) {
    const lead = await insertLead(data)
    const enriched = await getLeadWithDetails(lead.id)

    // Notificación en paralelo — si falla, no detiene el flujo
    telegramService.notifyNewLead(enriched ?? lead)

    return enriched ?? lead
  },
}
