import { chatService }  from '../services/chatService.js'
import { leadService }  from '../services/leadService.js'
import { getAllActive } from '../db/queries/plans.js'
import { respond }      from '../utils/respond.js'

function extractNameFromHistory(history) {
  for (const msg of [...history].reverse()) {
    if (msg.role !== 'user') continue
    const text = msg.content.trim()
    // Mensaje corto de solo letras y espacios — probablemente un nombre
    if (text.length >= 3 && text.length <= 40 && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(text)) {
      return text
    }
  }
  return 'Cliente Chat'
}

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

    const plans  = await getAllActive()
    const result = await chatService.processChat(sanitized, safeHistory, plans)

    // Captura automática de lead cuando se detecta celular
    if (result.action === 'SAVE_LEAD' && result.actionData?.phone) {
      const name = extractNameFromHistory(safeHistory)
      leadService.create({
        phone:       result.actionData.phone,
        name,
        chatSummary: '🤖 Lead por chatbot',
      }).catch((err) => console.error('[Chat lead] Error al guardar:', err.message))
    }

    respond(res, 200, result)
  } catch (err) {
    respond(res, 500, null, err.message)
  }
}
