import { pool } from '../connection.js'

export async function getProfile(sellerId) {
  const { rows } = await pool.query(
    `SELECT id, name, email, phone, callmebot_apikey, created_at
     FROM sellers WHERE id = $1 AND active = true`,
    [sellerId]
  )
  return rows[0] ?? null
}

export async function updateProfile(sellerId, { phone, callmebot_apikey }) {
  const sets   = []
  const params = []
  let   idx    = 1

  if (phone             !== undefined) { sets.push(`phone = $${idx}`);             params.push(phone || null);             idx++ }
  if (callmebot_apikey  !== undefined) { sets.push(`callmebot_apikey = $${idx}`);  params.push(callmebot_apikey || null);  idx++ }

  if (!sets.length) return null

  params.push(sellerId)
  const { rows } = await pool.query(
    `UPDATE sellers SET ${sets.join(', ')}
     WHERE id = $${idx}
     RETURNING id, name, email, phone, callmebot_apikey`,
    params
  )
  return rows[0] ?? null
}

export async function getSellerForNotification(sellerId) {
  const { rows } = await pool.query(
    `SELECT id, name, phone, callmebot_apikey
     FROM sellers WHERE id = $1 AND active = true`,
    [sellerId]
  )
  return rows[0] ?? null
}
