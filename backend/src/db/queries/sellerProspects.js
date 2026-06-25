import { pool } from '../connection.js'

const SELECT_PROSPECT = `
  sp.id, sp.seller_id, sp.prospect_name, sp.prospect_phone,
  sp.source, sp.status, sp.next_contact_date, sp.contact_attempts,
  sp.notes, sp.converted_to_client_id, sp.created_at, sp.updated_at,
  o.name AS operator_name, o.slug AS operator_slug,
  p.name AS plan_name
`

export async function createProspect({
  sellerId, prospectName, prospectPhone, operatorId, planId,
  source, nextContactDate, notes
}) {
  const { rows } = await pool.query(
    `INSERT INTO seller_prospects
       (seller_id, prospect_name, prospect_phone, operator_id, plan_id,
        source, next_contact_date, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [sellerId, prospectName, prospectPhone || null, operatorId || null, planId || null,
     source || 'otro', nextContactDate || null, notes || null]
  )
  return rows[0]
}

export async function getProspectsBySeller(sellerId, { status, page = 1, limit = 50 } = {}) {
  const conds  = ['sp.seller_id = $1']
  const params = [sellerId]
  let   idx    = 2

  if (status) { conds.push(`sp.status = $${idx}`); params.push(status); idx++ }

  const offset = (page - 1) * limit
  const where  = conds.join(' AND ')

  const { rows } = await pool.query(
    `SELECT ${SELECT_PROSPECT}
     FROM seller_prospects sp
     LEFT JOIN operators o ON o.id = sp.operator_id
     LEFT JOIN plans     p ON p.id = sp.plan_id
     WHERE ${where}
     ORDER BY
       CASE WHEN sp.next_contact_date IS NULL THEN 1 ELSE 0 END,
       sp.next_contact_date ASC,
       sp.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  )

  const { rows: [{ total }] } = await pool.query(
    `SELECT COUNT(*) AS total FROM seller_prospects sp WHERE ${where}`, params
  )

  return { prospects: rows, total: parseInt(total, 10) }
}

export async function updateProspectStatus(id, sellerId, status) {
  const { rows } = await pool.query(
    `UPDATE seller_prospects
     SET status = $1, updated_at = NOW()
     WHERE id = $2 AND seller_id = $3
     RETURNING id, status, updated_at`,
    [status, id, sellerId]
  )
  return rows[0] ?? null
}

export async function updateProspectNextContact(id, sellerId, date) {
  const { rows } = await pool.query(
    `UPDATE seller_prospects
     SET next_contact_date = $1, updated_at = NOW()
     WHERE id = $2 AND seller_id = $3
     RETURNING id, next_contact_date, updated_at`,
    [date || null, id, sellerId]
  )
  return rows[0] ?? null
}

export async function incrementProspectAttempts(id, sellerId) {
  const { rows } = await pool.query(
    `UPDATE seller_prospects
     SET contact_attempts = contact_attempts + 1, updated_at = NOW()
     WHERE id = $1 AND seller_id = $2
     RETURNING id, contact_attempts, updated_at`,
    [id, sellerId]
  )
  return rows[0] ?? null
}

export async function convertProspectToClient(prospectId, sellerId, clientData) {
  const {
    clientName, clientPhone, operatorId, planId,
    regularPrice, commissionPct, installationDate, notes,
  } = clientData

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. Crear cliente
    const { rows: [newClient] } = await client.query(
      `INSERT INTO seller_clients
         (seller_id, client_name, client_phone, operator_id, plan_id,
          regular_price, commission_pct, installation_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, client_name, client_phone, regular_price, commission_pct,
                 commission_amount, installation_date, commission_status, created_at`,
      [sellerId, clientName, clientPhone || null, operatorId || null, planId || null,
       regularPrice, commissionPct, installationDate, notes || null]
    )

    // 2. Marcar prospecto como cerrado (verifica seller_id por seguridad)
    const { rows: [updatedProspect] } = await client.query(
      `UPDATE seller_prospects
       SET status = 'cerrado',
           converted_to_client_id = $1,
           updated_at = NOW()
       WHERE id = $2 AND seller_id = $3
       RETURNING id, status, converted_to_client_id`,
      [newClient.id, prospectId, sellerId]
    )

    if (!updatedProspect) {
      // El prospecto no existe o no pertenece a este vendedor
      throw new Error('Prospecto no encontrado o no autorizado')
    }

    await client.query('COMMIT')
    return { client: newClient, prospect: updatedProspect }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function getTodayFollowUps(sellerId) {
  const { rows } = await pool.query(
    `SELECT ${SELECT_PROSPECT}
     FROM seller_prospects sp
     LEFT JOIN operators o ON o.id = sp.operator_id
     LEFT JOIN plans     p ON p.id = sp.plan_id
     WHERE sp.seller_id = $1
       AND sp.next_contact_date = CURRENT_DATE
       AND sp.status NOT IN ('cerrado','perdido')
     ORDER BY sp.created_at ASC`,
    [sellerId]
  )
  return rows
}

export async function getActiveProspectCount(sellerId) {
  const { rows: [{ count }] } = await pool.query(
    `SELECT COUNT(*) AS count FROM seller_prospects
     WHERE seller_id = $1 AND status NOT IN ('cerrado','perdido')`,
    [sellerId]
  )
  return parseInt(count, 10)
}

// ── Estadísticas de conversión (D) ────────────────────────────────────────────
export async function getConversionStats(sellerId) {
  const { rows: [s] } = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE sp.created_at >= date_trunc('month', NOW()))
         AS prospectos_mes,
       COUNT(*) FILTER (
         WHERE sp.converted_to_client_id IS NOT NULL
           AND sp.updated_at >= date_trunc('month', NOW())
       ) AS convertidos_mes,
       COALESCE(ROUND(
         CASE WHEN COUNT(*) FILTER (WHERE sp.created_at >= date_trunc('month', NOW())) = 0
              THEN 0
              ELSE COUNT(*) FILTER (
                     WHERE sp.converted_to_client_id IS NOT NULL
                       AND sp.updated_at >= date_trunc('month', NOW())
                   )::NUMERIC
                   / NULLIF(COUNT(*) FILTER (WHERE sp.created_at >= date_trunc('month', NOW())), 0) * 100
         END, 1), 0) AS tasa,
       COALESCE(ROUND(AVG(
         CASE WHEN sp.converted_to_client_id IS NOT NULL
              THEN EXTRACT(EPOCH FROM (sc.created_at - sp.created_at)) / 86400
         END
       ), 1), 0) AS dias_promedio
     FROM seller_prospects sp
     LEFT JOIN seller_clients sc ON sc.id = sp.converted_to_client_id
     WHERE sp.seller_id = $1`,
    [sellerId]
  )
  return {
    prospectos_mes:  parseInt(s.prospectos_mes, 10),
    convertidos_mes: parseInt(s.convertidos_mes, 10),
    tasa:            parseFloat(s.tasa),
    dias_promedio:   parseFloat(s.dias_promedio),
  }
}

// ── Proyección de comisiones (F) ───────────────────────────────────────────────
export async function getProjection(sellerId) {
  const { rows } = await pool.query(
    `SELECT
       sp.id, sp.prospect_name, sp.prospect_phone, sp.status,
       o.name  AS operator_name,
       p.name  AS plan_name,
       -- Extraer precio regular de features o usar price como fallback
       COALESCE(
         REGEXP_REPLACE(
           (SELECT f FROM UNNEST(p.features) AS f
            WHERE f ILIKE 'Precio regular:%' LIMIT 1),
           '[^0-9.]', '', 'g'
         )::NUMERIC,
         p.price
       ) AS regular_price,
       COALESCE(oc.commission_pct, 0) AS commission_pct,
       COALESCE(
         REGEXP_REPLACE(
           (SELECT f FROM UNNEST(p.features) AS f
            WHERE f ILIKE 'Precio regular:%' LIMIT 1),
           '[^0-9.]', '', 'g'
         )::NUMERIC,
         p.price
       ) * COALESCE(oc.commission_pct, 0) / 100 AS estimated_commission
     FROM seller_prospects sp
     LEFT JOIN operators            o  ON o.id  = sp.operator_id
     LEFT JOIN plans                p  ON p.id  = sp.plan_id
     LEFT JOIN operator_commissions oc ON oc.operator_id = sp.operator_id
     WHERE sp.seller_id = $1
       AND sp.status IN ('interesado','propuesta')
       AND sp.converted_to_client_id IS NULL
     ORDER BY estimated_commission DESC NULLS LAST`,
    [sellerId]
  )

  const total = rows.reduce((sum, r) => sum + parseFloat(r.estimated_commission ?? 0), 0)

  return {
    total_proyectado: Math.round(total * 100) / 100,
    prospectos:       rows.map(r => ({
      id:                   r.id,
      prospect_name:        r.prospect_name,
      prospect_phone:       r.prospect_phone,
      status:               r.status,
      operator_name:        r.operator_name,
      plan_name:            r.plan_name,
      estimated_commission: Math.round(parseFloat(r.estimated_commission ?? 0) * 100) / 100,
    })),
  }
}

// Para el cron de notificaciones
export async function getAllTodayFollowUpsWithSellers() {
  const { rows } = await pool.query(
    `SELECT sp.id, sp.prospect_name, sp.prospect_phone,
            sp.next_contact_date,
            o.name AS operator_name,
            p.name AS plan_name,
            s.id AS seller_id, s.name AS seller_name,
            s.phone AS seller_phone, s.callmebot_apikey
     FROM seller_prospects sp
     JOIN sellers   s ON s.id = sp.seller_id
     LEFT JOIN operators o ON o.id = sp.operator_id
     LEFT JOIN plans     p ON p.id = sp.plan_id
     WHERE sp.next_contact_date = CURRENT_DATE
       AND sp.status NOT IN ('cerrado','perdido')
       AND s.callmebot_apikey IS NOT NULL
       AND s.phone IS NOT NULL`
  )
  return rows
}
