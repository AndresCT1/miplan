import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// ── Operadores ───────────────────────────────────────────────────────────────
const operators = [
  { slug: 'movistar', name: 'Movistar', brand_color: '#009900' },
  { slug: 'claro',    name: 'Claro',    brand_color: '#DA291C' },
  { slug: 'wow',      name: 'WOW',      brand_color: '#FF6B00' },
  { slug: 'win',      name: 'WIN',      brand_color: '#7B2D8B' },
  { slug: 'mifibra',  name: 'Mi Fibra', brand_color: '#0066CC' },
]

// ── Planes por operador ──────────────────────────────────────────────────────
const plansBySlug = {
  movistar: [
    {
      name: 'Básico',
      speed_mbps: 50,
      price: 59.90,
      is_featured: false,
      features: ['WiFi incluido', 'Sin permanencia', 'Instalación gratis', 'Soporte 24/7'],
    },
    {
      name: 'Estándar',
      speed_mbps: 100,
      price: 79.90,
      is_featured: true,
      features: ['WiFi de doble banda', 'Sin permanencia', 'Instalación gratis', 'Atención preferencial'],
    },
    {
      name: 'Premium',
      speed_mbps: 200,
      price: 99.90,
      is_featured: false,
      features: ['WiFi 6 incluido', 'Sin permanencia', 'Instalación gratis', 'Soporte técnico prioritario'],
    },
  ],
  claro: [
    {
      name: 'Básico',
      speed_mbps: 50,
      price: 59.90,
      is_featured: false,
      features: ['WiFi incluido', 'Sin cortes garantizado', 'Instalación gratis', 'App Mi Claro'],
    },
    {
      name: 'Estándar',
      speed_mbps: 100,
      price: 79.90,
      is_featured: true,
      features: ['WiFi de doble banda', 'Sin cortes garantizado', 'Instalación gratis', 'Soporte 24/7'],
    },
    {
      name: 'Premium',
      speed_mbps: 300,
      price: 99.90,
      is_featured: false,
      features: ['WiFi 6 incluido', 'Sin cortes garantizado', 'Instalación gratis', 'Técnico a domicilio gratis'],
    },
  ],
  wow: [
    {
      name: 'Básico',
      speed_mbps: 60,
      price: 49.90,
      is_featured: false,
      features: ['WiFi incluido', 'Sin permanencia', 'Instalación gratis', 'Velocidad simétrica'],
    },
    {
      name: 'Estándar',
      speed_mbps: 120,
      price: 69.90,
      is_featured: true,
      features: ['WiFi de doble banda', 'Sin permanencia', 'Instalación gratis', 'Velocidad simétrica'],
    },
    {
      name: 'Premium',
      speed_mbps: 200,
      price: 89.90,
      is_featured: false,
      features: ['WiFi 6 incluido', 'Sin permanencia', 'Instalación gratis', 'IP fija opcional'],
    },
  ],
  win: [
    {
      name: 'Básico',
      speed_mbps: 50,
      price: 49.90,
      is_featured: false,
      features: ['WiFi incluido', 'Sin permanencia', 'Instalación gratis', 'Red de fibra óptica'],
    },
    {
      name: 'Estándar',
      speed_mbps: 100,
      price: 69.90,
      is_featured: true,
      features: ['WiFi de doble banda', 'Sin permanencia', 'Instalación gratis', 'Red de fibra óptica'],
    },
    {
      name: 'Premium',
      speed_mbps: 200,
      price: 89.90,
      is_featured: false,
      features: ['WiFi 6 incluido', 'Sin permanencia', 'Instalación gratis', 'Soporte técnico 24/7'],
    },
  ],
  mifibra: [
    {
      name: 'Básico',
      speed_mbps: 50,
      price: 45.90,
      is_featured: false,
      features: ['WiFi incluido', 'Sin permanencia', 'Instalación gratis', 'Precio fijo garantizado'],
    },
    {
      name: 'Estándar',
      speed_mbps: 100,
      price: 65.90,
      is_featured: true,
      features: ['WiFi de doble banda', 'Sin permanencia', 'Instalación gratis', 'Precio fijo garantizado'],
    },
    {
      name: 'Premium',
      speed_mbps: 200,
      price: 85.90,
      is_featured: false,
      features: ['WiFi 6 incluido', 'Sin permanencia', 'Instalación gratis', 'Soporte técnico prioritario'],
    },
  ],
}

async function seed() {
  console.log('\n🌱 Iniciando seed de MiPlan.pe...\n')

  // Upsert operadores
  console.log('📡 Insertando operadores...')
  for (const op of operators) {
    await pool.query(
      `INSERT INTO operators (slug, name, brand_color)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE
         SET name        = EXCLUDED.name,
             brand_color = EXCLUDED.brand_color`,
      [op.slug, op.name, op.brand_color]
    )
    console.log(`  ✅ ${op.name} (${op.slug})`)
  }

  // Insertar planes por operador
  console.log('\n📋 Insertando planes...')
  for (const [slug, plans] of Object.entries(plansBySlug)) {
    const { rows } = await pool.query(
      'SELECT id FROM operators WHERE slug = $1',
      [slug]
    )
    if (!rows.length) {
      console.error(`  ❌ Operador no encontrado: ${slug}`)
      continue
    }
    const operatorId = rows[0].id

    for (const plan of plans) {
      await pool.query(
        `INSERT INTO plans (operator_id, name, speed_mbps, price, features, is_featured)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [operatorId, plan.name, plan.speed_mbps, plan.price, plan.features, plan.is_featured]
      )
      const star = plan.is_featured ? ' ⭐' : ''
      console.log(`  ✅ [${slug}] ${plan.name} — ${plan.speed_mbps} Mbps / S/${plan.price}${star}`)
    }
  }

  console.log('\n✅ Seed completado.\n')
  await pool.end()
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err.message)
  pool.end()
  process.exit(1)
})
