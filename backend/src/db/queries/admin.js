import { pool } from '../connection.js'

export async function getAdminByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash FROM admin_users WHERE email = $1',
    [email]
  )
  return rows[0] ?? null
}

export async function getLeads({ status, operatorId, page = 1, limit = 20 } = {}) {
  const conditions = []
  const values     = []
  let idx = 1

  if (status) {
    conditions.push(`l.status = $${idx++}`)
    values.push(status)
  }
  if (operatorId) {
    conditions.push(`l.operator_id = $${idx++}`)
    values.push(parseInt(operatorId, 10))
  }

  const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const offset = (page - 1) * limit

  const { rows } = await pool.query(
    `SELECT l.id, l.dni, l.name, l.address, l.phone,
            l.status, l.created_at,
            o.name  AS operator_name,
            p.name  AS plan_name,
            p.price
     FROM leads l
     JOIN operators o ON l.operator_id = o.id
     JOIN plans     p ON l.plan_id     = p.id
     ${where}
     ORDER BY l.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, limit, offset]
  )

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total FROM leads l ${where}`,
    values
  )

  return {
    leads: rows,
    total: parseInt(countResult.rows[0].total, 10),
    page,
    limit,
  }
}

export async function updateLeadStatus(id, status) {
  const { rows } = await pool.query(
    'UPDATE leads SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  )
  return rows[0] ?? null
}

export async function getStats() {
  const { rows } = await pool.query(`
    WITH lead_counts AS (
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)             AS hoy,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')     AS semana,
        COUNT(*) FILTER (WHERE status = 'pending')                          AS pending,
        COUNT(*) FILTER (WHERE status = 'contacted')                        AS contacted,
        COUNT(*) FILTER (WHERE status = 'interested')                       AS interested,
        COUNT(*) FILTER (WHERE status = 'closed')                           AS closed_c,
        COUNT(*) FILTER (WHERE status = 'lost')                             AS lost
      FROM leads
    ),
    op_counts AS (
      SELECT o.name, COUNT(l.id) AS count
      FROM operators o
      LEFT JOIN leads l ON l.operator_id = o.id
      WHERE o.active = true
      GROUP BY o.id, o.name
      ORDER BY count DESC
    )
    SELECT
      lc.total     AS total_leads,
      lc.hoy       AS leads_hoy,
      lc.semana    AS leads_semana,
      JSON_BUILD_OBJECT(
        'pending',    lc.pending,
        'contacted',  lc.contacted,
        'interested', lc.interested,
        'closed',     lc.closed_c,
        'lost',       lc.lost
      ) AS por_estado,
      COALESCE(
        (SELECT JSON_AGG(JSON_BUILD_OBJECT('name', name, 'count', count))
         FROM op_counts),
        '[]'::json
      ) AS por_operador
    FROM lead_counts lc
  `)
  return rows[0]
}
