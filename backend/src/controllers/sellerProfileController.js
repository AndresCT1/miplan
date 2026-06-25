import bcrypt from 'bcryptjs'
import { getProfile, updateProfile,
         getSellerPasswordHash, updateSellerPassword } from '../db/queries/sellerProfile.js'
import { sellerNotificationService } from '../services/sellerNotificationService.js'
import { respond } from '../utils/respond.js'

export async function handleGetProfile(req, res, next) {
  try {
    const profile = await getProfile(req.seller.sellerId)
    if (!profile) return respond(res, 404, null, 'Perfil no encontrado')
    respond(res, 200, profile)
  } catch (err) { next(err) }
}

export async function handleUpdateProfile(req, res, next) {
  try {
    const { phone, callmebot_apikey } = req.body ?? {}

    if (phone && !/^9\d{8}$/.test(phone))
      return respond(res, 422, null, 'Teléfono inválido (9 dígitos, comienza con 9)')

    const updated = await updateProfile(req.seller.sellerId, { phone, callmebot_apikey })
    if (!updated) return respond(res, 404, null, 'Vendedor no encontrado')
    respond(res, 200, updated)
  } catch (err) { next(err) }
}

export async function handleTestNotification(req, res, next) {
  try {
    const profile = await getProfile(req.seller.sellerId)
    if (!profile?.phone || !profile?.callmebot_apikey)
      return respond(res, 422, null, 'Configura tu teléfono y API key antes de probar')

    const sent = await sellerNotificationService.testNotification(
      profile.phone, profile.callmebot_apikey
    )
    if (!sent) return respond(res, 502, null, 'No se pudo enviar el mensaje. Verifica tu API key.')
    respond(res, 200, { message: 'Mensaje de prueba enviado a tu WhatsApp' })
  } catch (err) { next(err) }
}

export async function handleChangePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body ?? {}

    if (!currentPassword || !newPassword)
      return respond(res, 422, null, 'Contraseña actual y nueva son requeridas')
    if (newPassword.length < 6)
      return respond(res, 422, null, 'La nueva contraseña debe tener mínimo 6 caracteres')

    const hash = await getSellerPasswordHash(req.seller.sellerId)
    if (!hash) return respond(res, 404, null, 'Vendedor no encontrado')

    const valid = await bcrypt.compare(currentPassword, hash)
    if (!valid) return respond(res, 401, null, 'Contraseña actual incorrecta')

    const newHash = await bcrypt.hash(newPassword, 10)
    await updateSellerPassword(req.seller.sellerId, newHash)

    respond(res, 200, { message: 'Contraseña cambiada correctamente' })
  } catch (err) { next(err) }
}
