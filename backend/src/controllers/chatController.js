import { chatService } from '../services/chatService.js'
import { getAllActive }  from '../db/queries/plans.js'
import { respond }      from '../utils/respond.js'

export async function handleChat(req, res) {
  try {
    const { message, history = [] } = req.body

    if (!message || typeof message !== 'string') {
      return respond(res, 422, null, 'El mensaje es requerido')
    }

    const sanitized = message.trim().slice(0, 500)
    if (!sanitized) return respond(res, 422, null, 'El mensaje no puede estar vacío')

    const safeHistory = Array.isArray(history)
      ? history.slice(-10).map((m) => ({
          role:    m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '').slice(0, 300),
        }))
      : []

    const plans = await getAllActive()
    const result = await chatService.processChat(sanitized, safeHistory, plans)

    respond(res, 200, result)
  } catch (err) {
    respond(res, 500, null, err.message)
  }
}
