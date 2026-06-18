const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`

function formatDate() {
  return new Date().toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export const telegramService = {
  async notifyNewLead(lead) {
    const text = [
      '🔔 *Nuevo cliente interesado*',
      `👤 DNI: ${lead.dni}`,
      `📛 Nombre: ${lead.name}`,
      `📍 Dirección: ${lead.address}`,
      `📱 Celular: ${lead.phone}`,
      `📡 Operador: ${lead.operator_name ?? lead.operator_id}`,
      `💼 Plan: ${lead.plan_name ?? lead.plan_id}`,
      `💰 Precio: S/${Number(lead.price ?? 0).toFixed(2)}/mes`,
      `🕐 ${formatDate()}`,
    ].join('\n')

    try {
      const res = await fetch(`${BASE_URL}/sendMessage`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id:    process.env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'Markdown',
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        console.error('[Telegram] Error HTTP', res.status, body)
      }
    } catch (err) {
      // Telegram falla → solo loguear, nunca interrumpir el lead
      console.error('[Telegram] Error de red:', err.message)
    }
  },
}
