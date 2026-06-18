import { pool } from '../connection.js'

export async function getAll() {
  const { rows } = await pool.query(
    `SELECT id, slug, name, logo_url, brand_color
     FROM operators
     WHERE active = true
     ORDER BY name`
  )
  return rows
}
