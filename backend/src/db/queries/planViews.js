import { pool } from '../connection.js'

export async function recordView(planId) {
  await pool.query(
    `INSERT INTO plan_views (plan_id) VALUES ($1)`,
    [planId]
  )
}

export async function getMonthlyViewCount(planId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS count
     FROM plan_views
     WHERE plan_id = $1
       AND viewed_at >= DATE_TRUNC('month', NOW() AT TIME ZONE 'America/Lima')`,
    [planId]
  )
  return parseInt(rows[0].count, 10)
}

// Distribuye el conteo mensual como si fuera del día actual
function calcDistributed(monthlyCount, dayOfMonth) {
  const avg = Math.round(monthlyCount / Math.max(1, dayOfMonth))
  return Math.min(60, Math.max(3, avg))
}

export async function getTodayDistributedCount(planId) {
  const monthlyCount = await getMonthlyViewCount(planId)
  const dayOfMonth   = new Date().getDate()
  return calcDistributed(monthlyCount, dayOfMonth)
}

// Versión bulk para evitar N+1 en getByOperator
export async function getBulkDistributedCounts(planIds) {
  if (planIds.length === 0) return {}

  const { rows } = await pool.query(
    `SELECT plan_id, COUNT(*) AS monthly_count
     FROM plan_views
     WHERE plan_id = ANY($1)
       AND viewed_at >= DATE_TRUNC('month', NOW() AT TIME ZONE 'America/Lima')
     GROUP BY plan_id`,
    [planIds]
  )

  const dayOfMonth   = new Date().getDate()
  const countMap     = {}

  // Todos los planIds tienen al menos el mínimo (3)
  planIds.forEach((id) => { countMap[id] = calcDistributed(0, dayOfMonth) })
  rows.forEach(({ plan_id, monthly_count }) => {
    countMap[plan_id] = calcDistributed(parseInt(monthly_count, 10), dayOfMonth)
  })

  return countMap
}
