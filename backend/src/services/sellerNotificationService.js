export const sellerNotificationService = {
  async sendWhatsApp(phone, apikey, message) {
    if (!phone || !apikey) return false
    try {
      const encoded = encodeURIComponent(message)
      const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apikey}`
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (!res.ok) {
        console.warn(`[CallMeBot] Error ${res.status} para ${phone}`)
        return false
      }
      return true
    } catch (err) {
      console.warn('[CallMeBot] Error de red:', err.message)
      return false
    }
  },

  async notifyFollowUp(seller, prospect) {
    const dateStr = prospect.next_contact_date
      ? new Date(prospect.next_contact_date + 'T00:00:00').toLocaleDateString('es-PE')
      : '—'
    const message = [
      '🔔 Seguimiento pendiente',
      `👤 ${prospect.prospect_name}`,
      prospect.operator_name ? `📡 Operador: ${prospect.operator_name}` : null,
      `📅 Fecha agendada: ${dateStr}`,
      prospect.prospect_phone ? `📱 Llamar: ${prospect.prospect_phone}` : null,
    ].filter(Boolean).join('\n')

    return this.sendWhatsApp(seller.phone, seller.callmebot_apikey, message)
  },

  async notifyCommissionPaid(seller, client) {
    const message = [
      '✅ ¡Comisión pagada!',
      `👤 Cliente: ${client.client_name}`,
      `💰 Monto: S/${parseFloat(client.commission_amount).toFixed(2)}`,
      '¡Gracias por tu venta!',
    ].join('\n')

    return this.sendWhatsApp(seller.phone, seller.callmebot_apikey, message)
  },

  async testNotification(phone, apikey) {
    const message = '✅ MiPlan.pe — Notificaciones configuradas correctamente 🎉'
    return this.sendWhatsApp(phone, apikey, message)
  },
}
