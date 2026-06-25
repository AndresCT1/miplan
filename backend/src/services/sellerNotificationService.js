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
    const planInfo = [prospect.operator_name, prospect.plan_name]
      .filter(Boolean).join(' - ')
    const message = [
      '🔔 MiPlan.pe — Seguimiento de hoy',
      `👤 ${prospect.prospect_name}`,
      prospect.prospect_phone ? `📱 Llamar: ${prospect.prospect_phone}` : null,
      planInfo ? `📡 Interesado en: ${planInfo}` : null,
      '',
      'Recuerda contactarlo hoy.',
    ].filter(v => v !== null).join('\n')

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
    const message = [
      '✅ MiPlan.pe — Notificaciones activadas',
      'Recibirás recordatorios de seguimiento',
      'cada mañana a las 8am. ¡Bienvenido!',
    ].join('\n')
    return this.sendWhatsApp(phone, apikey, message)
  },
}
