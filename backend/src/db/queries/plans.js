import { pool } from '../connection.js'

export async function getByOperator(operatorId) {
  const { rows } = await pool.query(
    `SELECT id, operator_id, name, speed_mbps, price, features, is_featured, active, created_at
     FROM plans
     WHERE operator_id = $1 AND active = true
     ORDER BY price ASC`,
    [operatorId]
  )
  return rows
}

export async function getCompare(ids) {
  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.speed_mbps, p.price, p.features, p.is_featured,
            o.id AS operator_id, o.name AS operator_name, o.slug AS operator_slug,
            o.brand_color
     FROM plans p
     JOIN operators o ON p.operator_id = o.id
     WHERE p.id = ANY($1) AND p.active = true AND o.active = true
     ORDER BY p.price ASC`,
    [ids]
  )
  return rows
}

export async function getFeatured() {
  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.speed_mbps, p.price, p.features, p.is_featured,
            o.id AS operator_id, o.name AS operator_name,
            o.slug AS operator_slug, o.brand_color
     FROM plans p
     JOIN operators o ON p.operator_id = o.id
     WHERE p.is_featured = true AND p.active = true AND o.active = true
     ORDER BY p.price ASC`
  )
  return rows
}
