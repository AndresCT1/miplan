import { pool } from '../connection.js'
import { createClient } from './sellerClients.js'

const SELECT_PROSPECT = `
  sp.id, sp.seller_id, sp.prospect_name, sp.prospect_phone,
  sp.source, sp.status, sp.next_contact_date, sp.contact_attempts,
  sp.notes, sp.converted_to_client_id, sp.created_at, sp.updated_at,
  o.name AS operator_name, o.slug AS operator_slug,
  p.name AS plan_name
`

export async function createProspect({
  sellerId, prospectName, prospectPhone, operatorId, planId,
  source, nextContactDate, notes
}) {
  const { rows } = await pool.query(
    `INSERT INTO seller_prospects
       (seller_id, prospect_name, prospect_phone, operator_id, plan_id,
        source, next_contact_date, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [sellerId, prospectName, prospectPhone || null, operatorId || null, planId || null,
     source || 'otro', nextContactDate || null, notes || null]
  )
  return rows[0]
}

export async function getProspectsBySeller(sellerId, { status, page = 1, limit = 50 } = {}) {
  const conds  = ['sp.seller_id = $1']
  const params = [sellerId]
  let   idx    = 2

  if (status) { conds.push(`sp.status = $${idx}`); params.push(status); idx++ }

  const offset = (page - 1) * limit
  const where  = conds.join(' AND ')

  const { rows } = await pool.query(
    `SELECT ${SELECT_PROSPECT}
     FROM seller_prospects sp
     LEFT JOIN operators o ON o.id = sp.operator_id
     LEFT JOIN plans     p ON p.id = sp.plan_id
     WHERE ${where}
     ORDER BY
       CASE WHEN sp.next_contact_date IS NULL THEN 1 ELSE 0 END,
       sp.next_contact_date ASC,
       sp.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  )

  const { rows: [{ total }] } = await pool.query(
    `SELECT COUNT(*) AS total FROM seller_prospects sp WHERE ${where}`, params
  )

  return { prospects: rows, total: parseInt(total, 10) }
}

export async function updateProspectStatus(id, sellerId, status) {
  const { rows } = await pool.query(
    `UPDATE seller_prospects
     SET status = $1, updated_at = NOW()
     WHERE id = $2 AND seller_id = $3
     RETURNING id, status, updated_at`,
    [status, id, sellerId]
  )
  return rows[0] ?? null
}

export async function updateProspectNextContact(id, sellerId, date) {
  const { rows } = await pool.query(
    `UPDATE seller_prospects
     SET next_contact_date = $1, updated_at = NOW()
     WHERE id = $2 AND seller_id = $3
     RETURNING id, next_contact_date, updated_at`,
    [date || null, id, sellerId]
  )
  return rows[0] ?? null
}

export async function incrementProspectAttempts(id, sellerId) {
  const { rows } = await pool.query(
    `UPDATE seller_prospects
     SET contact_attempts = contact_attempts + 1, updated_at = NOW()
     WHERE id = $2 AND seller_id = $3
     RETURNING id, contact_attempts, updated_at`,
    [id, id, sellerId]
  )
  return rows[0] ?? null
}

export async function convertProspectToClient(prospectId, sellerId, clientData) {
  const client = await createClient({ sellerId, ...clientData })

  const { rows } = await pool.query(
    `UPDATE seller_prospects
     SET status = 'cerrado',
         converted_to_client_id = $1,
         updated_at = NOW()
     WHERE id = $2 AND seller_id = $3
     RETURNING id, status, converted_to_client_id`,
    [client.id, prospectId, sellerId]
  )

  return { client, prospect: rows[0] }
}

export async function getTodayFollowUps(sellerId) {
  const { rows } = await pool.query(
    `SELECT ${SELECT_PROSPECT}
     FROM seller_prospects sp
     LEFT JOIN operators o ON o.id = sp.operator_id
     LEFT JOIN plans     p ON p.id = sp.plan_id
     WHERE sp.seller_id = $1
       AND sp.next_contact_date = CURRENT_DATE
       AND sp.status NOT IN ('cerrado','perdido')
     ORDER BY sp.created_at ASC`,
    [sellerId]
  )
  return rows
}

export async function getActiveProspectCount(sellerId) {
  const { rows: [{ count }] } = await pool.query(
    `SELECT COUNT(*) AS count FROM seller_prospects
     WHERE seller_id = $1 AND status NOT IN ('cerrado','perdido')`,
    [sellerId]
  )
  return parseInt(count, 10)
}

// Para el cron de notificaciones
export async function getAllTodayFollowUpsWithSellers() {
  const { rows } = await pool.query(
    `SELECT sp.id, sp.prospect_name, sp.prospect_phone,
            sp.next_contact_date,
            o.name AS operator_name,
            s.id AS seller_id, s.name AS seller_name,
            s.phone AS seller_phone, s.callmebot_apikey
     FROM seller_prospects sp
     JOIN sellers   s ON s.id = sp.seller_id
     LEFT JOIN operators o ON o.id = sp.operator_id
     WHERE sp.next_contact_date = CURRENT_DATE
       AND sp.status NOT IN ('cerrado','perdido')
       AND s.callmebot_apikey IS NOT NULL
       AND s.phone IS NOT NULL`
  )
  return rows
}
