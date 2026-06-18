import { pool } from '../connection.js'

export async function getAll() {
  const { rows } = await pool.query(
    `SELECT o.id, o.slug, o.name, o.logo_url, o.brand_color,
            COUNT(p.id)  AS plan_count,
            MIN(p.price) AS min_price
     FROM operators o
     LEFT JOIN plans p ON p.operator_id = o.id AND p.active = true
     WHERE o.active = true
     GROUP BY o.id, o.slug, o.name, o.logo_url, o.brand_color
     ORDER BY o.name`
  )
  return rows
}
