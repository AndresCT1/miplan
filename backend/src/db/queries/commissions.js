import { pool } from '../connection.js'

export async function getAllCommissions() {
  const { rows } = await pool.query(
    `SELECT o.id, o.name, o.slug, o.logo_url,
            COALESCE(oc.commission_pct, 0) AS commission_pct
     FROM operators o
     LEFT JOIN operator_commissions oc ON oc.operator_id = o.id
     WHERE o.active = true
     ORDER BY o.name`
  )
  return rows
}

export async function getSellerCatalog() {
  const { rows } = await pool.query(
    `SELECT
       o.id, o.name, o.slug, o.logo_url, o.brand_color,
       COALESCE(oc.commission_pct, 0) AS commission_pct,
       COALESCE(
         JSON_AGG(
           JSON_BUILD_OBJECT(
             'id',         p.id,
             'name',       p.name,
             'speed_mbps', p.speed_mbps,
             'price',      p.price,
             'features',   p.features
           ) ORDER BY p.price ASC
         ) FILTER (WHERE p.id IS NOT NULL),
         '[]'
       ) AS plans
     FROM operators o
     LEFT JOIN operator_commissions oc ON oc.operator_id = o.id
     LEFT JOIN plans p ON p.operator_id = o.id AND p.active = true
     WHERE o.active = true
     GROUP BY o.id, o.name, o.slug, o.logo_url, o.brand_color, oc.commission_pct
     ORDER BY o.name`
  )
  return rows
}

export async function upsertCommission(operatorId, commissionPct) {
  const { rows } = await pool.query(
    `INSERT INTO operator_commissions (operator_id, commission_pct, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (operator_id)
     DO UPDATE SET commission_pct = EXCLUDED.commission_pct,
                   updated_at     = NOW()
     RETURNING *`,
    [operatorId, commissionPct]
  )
  return rows[0]
}

export async function getCommissionByOperator(operatorId) {
  const { rows } = await pool.query(
    `SELECT commission_pct FROM operator_commissions WHERE operator_id = $1`,
    [operatorId]
  )
  return rows[0]?.commission_pct ?? 0
}
