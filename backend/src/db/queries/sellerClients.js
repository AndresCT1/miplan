import { pool } from '../connection.js'

const SELECT_CLIENT = `
  sc.id, sc.seller_id, sc.client_name, sc.client_phone,
  sc.regular_price, sc.commission_pct, sc.commission_amount,
  sc.installation_date, sc.commission_status, sc.commission_paid_at,
  sc.notes, sc.created_at,
  o.name AS operator_name, o.slug AS operator_slug,
  p.name AS plan_name
`

export async function createClient({
  sellerId, clientName, clientPhone, operatorId, planId,
  regularPrice, commissionPct, installationDate, notes
}) {
  const { rows } = await pool.query(
    `INSERT INTO seller_clients
       (seller_id, client_name, client_phone, operator_id, plan_id,
        regular_price, commission_pct, installation_date, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id, client_name, client_phone, regular_price, commission_pct,
               commission_amount, installation_date, commission_status, created_at`,
    [sellerId, clientName, clientPhone, operatorId, planId,
     regularPrice, commissionPct, installationDate, notes || null]
  )
  return rows[0]
}

export async function getClientsBySeller(sellerId, { status, page = 1, limit = 20 } = {}) {
  const conds  = ['sc.seller_id = $1']
  const params = [sellerId]
  let   idx    = 2

  if (status) { conds.push(`sc.commission_status = $${idx}`); params.push(status); idx++ }

  const offset = (page - 1) * limit
  const where  = conds.join(' AND ')

  const { rows } = await pool.query(
    `SELECT ${SELECT_CLIENT}
     FROM seller_clients sc
     LEFT JOIN operators o ON o.id = sc.operator_id
     LEFT JOIN plans     p ON p.id = sc.plan_id
     WHERE ${where}
     ORDER BY sc.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  )

  const { rows: [{ total }] } = await pool.query(
    `SELECT COUNT(*) AS total FROM seller_clients sc WHERE ${where}`, params
  )

  return { clients: rows, total: parseInt(total, 10) }
}

export async function getRecentClients(sellerId, limit = 3) {
  const { rows } = await pool.query(
    `SELECT ${SELECT_CLIENT}
     FROM seller_clients sc
     LEFT JOIN operators o ON o.id = sc.operator_id
     LEFT JOIN plans     p ON p.id = sc.plan_id
     WHERE sc.seller_id = $1
     ORDER BY sc.created_at DESC
     LIMIT $2`,
    [sellerId, limit]
  )
  return rows
}

export async function getClientStats(sellerId) {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

  const { rows: [s] } = await pool.query(
    `SELECT
       COUNT(*)                                                        AS total_clients,
       COALESCE(SUM(commission_amount) FILTER (WHERE commission_status = 'pending'), 0)
                                                                       AS pending_commission,
       COALESCE(SUM(commission_amount)
         FILTER (WHERE commission_status = 'paid'
           AND TO_CHAR(commission_paid_at,'YYYY-MM') = $2), 0)        AS paid_this_month
     FROM seller_clients
     WHERE seller_id = $1`,
    [sellerId, currentMonth]
  )
  return s
}

export async function updateClientNotes(clientId, sellerId, notes) {
  const { rows } = await pool.query(
    `UPDATE seller_clients SET notes = $1
     WHERE id = $2 AND seller_id = $3
     RETURNING id, notes`,
    [notes, clientId, sellerId]
  )
  return rows[0] ?? null
}

// ── Admin ──────────────────────────────────────────────────────────────────────
export async function adminGetAllClients({ status, sellerId, page = 1, limit = 30 } = {}) {
  const conds  = []
  const params = []
  let   idx    = 1

  if (status)   { conds.push(`sc.commission_status = $${idx}`); params.push(status);             idx++ }
  if (sellerId) { conds.push(`sc.seller_id = $${idx}`);         params.push(parseInt(sellerId)); idx++ }

  const where  = conds.length ? `WHERE ${conds.join(' AND ')}` : ''
  const offset = (page - 1) * limit

  const { rows } = await pool.query(
    `SELECT ${SELECT_CLIENT},
            s.name AS seller_name, s.phone AS seller_phone,
            s.callmebot_apikey
     FROM seller_clients sc
     LEFT JOIN operators o ON o.id = sc.operator_id
     LEFT JOIN plans     p ON p.id = sc.plan_id
     JOIN      sellers   s ON s.id = sc.seller_id
     ${where}
     ORDER BY sc.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  )

  const { rows: [totals] } = await pool.query(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(commission_amount) FILTER (WHERE commission_status='pending'),0) AS pending_total
     FROM seller_clients sc ${where}`,
    params
  )

  return {
    clients:       rows,
    total:         parseInt(totals.total, 10),
    pendingTotal:  parseFloat(totals.pending_total),
  }
}

export async function adminMarkCommissionPaid(clientId) {
  const { rows } = await pool.query(
    `UPDATE seller_clients
     SET commission_status = 'paid', commission_paid_at = NOW()
     WHERE id = $1 AND commission_status = 'pending'
     RETURNING id, client_name, commission_amount,
               seller_id, commission_status, commission_paid_at`,
    [clientId]
  )
  return rows[0] ?? null
}
