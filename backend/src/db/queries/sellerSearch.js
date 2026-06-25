import { pool } from '../connection.js'

export async function searchSellerData(sellerId, q) {
  const term = `%${q}%`

  const [clientsRes, prospectsRes] = await Promise.all([
    pool.query(
      `SELECT sc.id, sc.client_name, sc.client_phone,
              sc.commission_status, sc.commission_amount,
              o.name AS operator_name
       FROM seller_clients sc
       LEFT JOIN operators o ON o.id = sc.operator_id
       WHERE sc.seller_id = $1
         AND (sc.client_name ILIKE $2 OR sc.client_phone ILIKE $2)
       ORDER BY sc.created_at DESC
       LIMIT 5`,
      [sellerId, term]
    ),
    pool.query(
      `SELECT sp.id, sp.prospect_name, sp.prospect_phone,
              sp.status, sp.next_contact_date,
              o.name AS operator_name
       FROM seller_prospects sp
       LEFT JOIN operators o ON o.id = sp.operator_id
       WHERE sp.seller_id = $1
         AND (sp.prospect_name ILIKE $2 OR sp.prospect_phone ILIKE $2)
       ORDER BY sp.updated_at DESC
       LIMIT 5`,
      [sellerId, term]
    ),
  ])

  return {
    clients:   clientsRes.rows,
    prospects: prospectsRes.rows,
  }
}
