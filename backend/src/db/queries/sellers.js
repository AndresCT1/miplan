import { pool } from '../connection.js'

export async function getSellerByEmail(email) {
  const { rows } = await pool.query(
    `SELECT * FROM sellers WHERE email = $1 AND active = true`,
    [email]
  )
  return rows[0] ?? null
}

export async function getSellerById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, email FROM sellers WHERE id = $1 AND active = true`,
    [id]
  )
  return rows[0] ?? null
}

export async function getSellerSales({ sellerId, status, month, page, limit }) {
  const conditions = ['ss.seller_id = $1']
  const params = [sellerId]
  let idx = 2

  if (status) {
    conditions.push(`ss.status = $${idx}`)
    params.push(status)
    idx++
  }
  if (month) {
    conditions.push(`TO_CHAR(ss.created_at, 'YYYY-MM') = $${idx}`)
    params.push(month)
    idx++
  }

  const offset = (page - 1) * limit

  const countRes = await pool.query(
    `SELECT COUNT(*) FROM seller_sales ss WHERE ${conditions.join(' AND ')}`,
    params
  )
  const total = parseInt(countRes.rows[0].count, 10)

  const { rows } = await pool.query(
    `SELECT ss.*,
            o.name  AS operator_name,
            o.logo_url,
            p.name  AS plan_name,
            p.price AS plan_price
     FROM seller_sales ss
     JOIN operators o ON o.id = ss.operator_id
     JOIN plans     p ON p.id = ss.plan_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY ss.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  )

  return { sales: rows, total }
}

export async function getSellerDashboard(sellerId) {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const today = now.toISOString().split('T')[0]

  const { rows: [stats] } = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE TO_CHAR(created_at,'YYYY-MM') = $2)            AS sales_this_month,
       COALESCE(SUM(commission_amount) FILTER (WHERE TO_CHAR(created_at,'YYYY-MM') = $2), 0) AS commission_this_month,
       COUNT(*) FILTER (WHERE follow_up_date <= $3 AND status NOT IN ('closed','lost'))       AS urgent_followups
     FROM seller_sales
     WHERE seller_id = $1`,
    [sellerId, currentMonth, today]
  )

  const { rows: urgent } = await pool.query(
    `SELECT ss.id, ss.client_name, ss.client_phone, ss.follow_up_date, ss.status, ss.notes,
            o.name AS operator_name, p.name AS plan_name
     FROM seller_sales ss
     JOIN operators o ON o.id = ss.operator_id
     JOIN plans     p ON p.id = ss.plan_id
     WHERE ss.seller_id = $1
       AND ss.follow_up_date <= $2
       AND ss.status NOT IN ('closed','lost')
     ORDER BY ss.follow_up_date ASC
     LIMIT 10`,
    [sellerId, today]
  )

  return { stats, urgentFollowups: urgent }
}

export async function insertSale({
  sellerId, clientName, clientPhone,
  operatorId, planId, commissionAmount,
  followUpDate, notes
}) {
  const { rows } = await pool.query(
    `INSERT INTO seller_sales
       (seller_id, client_name, client_phone, operator_id, plan_id,
        commission_amount, follow_up_date, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [sellerId, clientName, clientPhone,
     operatorId, planId, commissionAmount,
     followUpDate || null, notes || null]
  )
  return rows[0]
}

export async function updateSale(id, sellerId, fields) {
  const allowed = ['status', 'follow_up_date', 'notes']
  const sets = []
  const params = []
  let idx = 1

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = $${idx}`)
      params.push(fields[key])
      idx++
    }
  }

  if (!sets.length) return null

  params.push(id, sellerId)
  const { rows } = await pool.query(
    `UPDATE seller_sales SET ${sets.join(', ')}
     WHERE id = $${idx} AND seller_id = $${idx + 1}
     RETURNING *`,
    params
  )
  return rows[0] ?? null
}

export async function markContacted(id, sellerId) {
  const { rows } = await pool.query(
    `UPDATE seller_sales
     SET status = 'contacted'
     WHERE id = $1 AND seller_id = $2 AND status = 'pending'
     RETURNING *`,
    [id, sellerId]
  )
  return rows[0] ?? null
}
