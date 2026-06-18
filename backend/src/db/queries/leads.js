import { pool } from '../connection.js'

export async function insertLead({ dni, name, address, phone, operatorId, planId, chatSummary }) {
  const { rows } = await pool.query(
    `INSERT INTO leads (dni, name, address, phone, operator_id, plan_id, status, chat_summary)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
     RETURNING *`,
    [
      dni         ?? null,
      name,
      address     ?? null,
      phone,
      operatorId  ?? null,
      planId      ?? null,
      chatSummary ?? null,
    ]
  )
  return rows[0]
}

export async function getLeadWithDetails(leadId) {
  const { rows } = await pool.query(
    `SELECT l.*,
            o.name     AS operator_name,
            p.name     AS plan_name,
            p.price    AS price,
            p.speed_mbps
     FROM leads l
     LEFT JOIN operators o ON l.operator_id = o.id
     LEFT JOIN plans p     ON l.plan_id     = p.id
     WHERE l.id = $1`,
    [leadId]
  )
  return rows[0] ?? null
}
