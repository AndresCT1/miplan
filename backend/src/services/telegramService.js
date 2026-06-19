const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`

export const telegramService = {
  async notifyNewLead(lead) {
    const phone = lead.phone ?? ''

    const lines = [
      '🔔 *Nuevo lead — contactar YA*',
      lead.chat_summary ? `🏷️ *Fuente:* ${lead.chat_summary}` : null,
      '',
      `📱 *Celular:* ${phone}`,
      `👤 *Nombre:* ${lead.name}`,
      `📡 *Operador:* ${lead.operator_name ?? '—'}`,
      `💼 *Plan:* ${lead.plan_name ?? '—'}`,
      lead.price != null
        ? `💰 *Precio:* S/${Number(lead.price).toFixed(2)}/mes`
        : null,
      `🕐 *Hace:* justo ahora`,
      '',
      '━━━━━━━━━━━━━━━',
    ]

    const text = lines.filter(Boolean).join('\n')

    const payload = {
      chat_id:    process.env.TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '💬 WhatsApp', url: `https://wa.me/51${phone}` },
        ]],
      },
    }

    try {
      const res = await fetch(`${BASE_URL}/sendMessage`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.text()
        console.error('[Telegram] Error HTTP', res.status, body)
      }
    } catch (err) {
      console.error('[Telegram] Error de red:', err.message)
    }
  },
}
