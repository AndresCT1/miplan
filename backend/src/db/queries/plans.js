import { pool }                       from '../connection.js'
import { getBulkDistributedCounts }  from './planViews.js'

export async function getByOperator(operatorId) {
  const { rows } = await pool.query(
    `SELECT id, operator_id, name, speed_mbps, price, features, is_featured, active, created_at
     FROM plans
     WHERE operator_id = $1 AND active = true
     ORDER BY price ASC`,
    [operatorId]
  )

  if (rows.length === 0) return rows

  // Una sola query para todos los conteos — sin N+1
  const planIds  = rows.map((r) => r.id)
  const viewsMap = await getBulkDistributedCounts(planIds)

  return rows.map((r) => ({ ...r, views_today: viewsMap[r.id] ?? 3 }))
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

export async function getAllActive() {
  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.speed_mbps, p.price,
            o.name AS operator_name, o.slug AS operator_slug
     FROM plans p
     JOIN operators o ON p.operator_id = o.id
     WHERE p.active = true AND o.active = true
     ORDER BY o.name, p.price ASC`
  )
  return rows
}

export async function getAllForListing({ sort = 'price_asc', category } = {}) {
  const ORDER_MAP = {
    price_asc:  'p.price ASC, p.speed_mbps DESC',
    price_desc: 'p.price DESC',
    speed_desc: 'p.speed_mbps DESC, p.price ASC',
  }
  const orderClause = ORDER_MAP[sort] ?? ORDER_MAP.price_asc

  const tvCondition = `EXISTS (
    SELECT 1 FROM unnest(p.features) f
    WHERE f ILIKE '%TV%' OR f ILIKE '%televi%' OR f ILIKE '%cable%'
  )`

  let extraWhere = ''
  if (category === 'internet_tv') extraWhere = `AND ${tvCondition}`
  if (category === 'internet')    extraWhere = `AND NOT ${tvCondition}`

  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.speed_mbps, p.price, p.features, p.is_featured,
            o.id AS operator_id, o.name AS operator_name,
            o.slug AS operator_slug, o.brand_color, o.logo_url
     FROM plans p
     JOIN operators o ON p.operator_id = o.id
     WHERE p.active = true AND o.active = true ${extraWhere}
     ORDER BY ${orderClause}`
  )
  return rows
}
