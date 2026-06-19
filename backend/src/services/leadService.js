import { insertLead, getLeadWithDetails } from '../db/queries/leads.js'
import { telegramService }   from './telegramService.js'
import { callMeBotService }  from './callMeBotService.js'

export const leadService = {
  async create(data) {
    const lead     = await insertLead(data)
    const enriched = await getLeadWithDetails(lead.id)
    const payload  = enriched ?? lead

    // Notificaciones en paralelo — si una falla la otra sigue
    Promise.allSettled([
      telegramService.notifyNewLead(payload),
      callMeBotService.notifyNewLead(payload),
    ]).then((results) => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`[leadService] Notificación ${i === 0 ? 'Telegram' : 'CallMeBot'} falló:`, r.reason)
        }
      })
    })

    return payload
  },
}
