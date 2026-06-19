const CALLMEBOT_PHONE  = process.env.CALLMEBOT_PHONE
const CALLMEBOT_APIKEY = process.env.CALLMEBOT_APIKEY

export const callMeBotService = {
  async notifyNewLead(lead) {
    if (!CALLMEBOT_PHONE || !CALLMEBOT_APIKEY) {
      console.warn('[CallMeBot] No configurado, saltando notificación WhatsApp')
      return
    }

    const message = [
      '🔔 Nuevo lead - contactar YA',
      '',
      `📱 Celular: ${lead.phone}`,
      `👤 Nombre: ${lead.name}`,
      `📡 Operador: ${lead.operator_name || 'No especificado'}`,
      `💼 Plan: ${lead.plan_name || 'No especificado'}`,
      lead.price ? `💰 Precio: S/${Number(lead.price).toFixed(2)}/mes` : '',
      '',
      `💬 WhatsApp: https://wa.me/51${lead.phone}`,
    ].filter(Boolean).join('\n')

    try {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_APIKEY}`
      console.log('CallMeBot URL:', url)
      const res = await fetch(url)
      console.log('CallMeBot status:', res.status)
      const responseText = await res.text()
      console.log('CallMeBot response:', responseText)
      if (!res.ok) {
        console.error('[CallMeBot] Error HTTP:', res.status, responseText)
      }
    } catch (err) {
      console.error('[CallMeBot] Error de red:', err.message)
    }
  },
}
