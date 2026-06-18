import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// ── Operadores ───────────────────────────────────────────────────────────────
const operators = [
  { slug: 'mifibra',  name: 'Mi Fibra',  brand_color: '#E91E8C' },
  { slug: 'movistar', name: 'Movistar',  brand_color: '#00A8E0' },
  { slug: 'claro',    name: 'Claro',     brand_color: '#DA291C' },
  { slug: 'win',      name: 'WIN',       brand_color: '#FF6B00' },
  { slug: 'wow',      name: 'WOW',       brand_color: '#9B59B6' },
]

// ── Planes por operador ──────────────────────────────────────────────────────
const plansBySlug = {
  mifibra: [
    // Solo Internet
    { name: 'Internet 1000 Mbps',    speed_mbps: 1000, price: 59.90,  is_featured: false,
      features: ['100% Fibra Óptica','WiFi 5 alta velocidad','Alquiler hasta 1 Mesh','Instalación gratis'] },
    { name: 'Internet 2000 Mbps',    speed_mbps: 2000, price: 69.90,  is_featured: true,
      features: ['100% Fibra Óptica','WiFi 6 ultra velocidad','Alquiler hasta 1 Mesh','Plan recomendado'] },
    { name: 'Internet 3000 Mbps',    speed_mbps: 3000, price: 89.90,  is_featured: false,
      features: ['100% Fibra Óptica','WiFi 6 ultra velocidad','Alquiler hasta 2 Mesh','Atención 2 horas'] },
    { name: 'Internet 5000 Mbps',    speed_mbps: 5000, price: 119.90, is_featured: false,
      features: ['100% Fibra Óptica','WiFi 7 ultra velocidad','Alquiler hasta 2 Mesh','Atención 2 horas'] },
    // Internet + TV
    { name: 'Internet + TV 1000 Mbps', speed_mbps: 1000, price: 60.90, is_featured: false,
      features: ['MiFibra TVGO incluido','Liga 1 MAX incluido','WiFi 5 alta velocidad','Alquiler hasta 1 Mesh'] },
    { name: 'Internet + TV 2000 Mbps', speed_mbps: 2000, price: 70.90, is_featured: false,
      features: ['MiFibra TVGO incluido','Liga 1 MAX incluido','WiFi 6 ultra velocidad','Plan recomendado'] },
    { name: 'Internet + TV 3000 Mbps', speed_mbps: 3000, price: 89.90, is_featured: false,
      features: ['MiFibra TVGO incluido','Liga 1 MAX incluido','WiFi 6 ultra velocidad','Alquiler hasta 2 Mesh'] },
    { name: 'Internet + TV 5000 Mbps', speed_mbps: 5000, price: 119.90, is_featured: false,
      features: ['MiFibra TVGO incluido','Liga 1 MAX incluido','WiFi 7 ultra velocidad','Alquiler hasta 2 Mesh'] },
  ],
  movistar: [
    // Solo Internet
    { name: 'Internet Fibra 400 Mbps',  speed_mbps: 400,  price: 79.90,  is_featured: true,
      features: ['Velocidad simétrica','Movistar TV App Full','Bono 1000 Mbps x1 año','Instalación gratis'] },
    { name: 'Internet Fibra 600 Mbps',  speed_mbps: 600,  price: 99.90,  is_featured: false,
      features: ['Velocidad simétrica','Movistar TV App Full','Disney+ 6 meses gratis','Instalación gratis'] },
    { name: 'Internet Fibra 1000 Mbps', speed_mbps: 1000, price: 139.90, is_featured: false,
      features: ['Velocidad simétrica','Movistar TV App Full','Disney+ incluido','Instalación gratis'] },
    // Internet + TV
    { name: 'Internet + TV 400 Mbps',  speed_mbps: 400,  price: 149.90, is_featured: false,
      features: ['Velocidad simétrica','1 deco incluido','Movistar TV App x12 meses','Disney+ por siempre'] },
    { name: 'Internet + TV 600 Mbps',  speed_mbps: 600,  price: 169.90, is_featured: false,
      features: ['Velocidad simétrica','1 deco incluido','Movistar TV App x12 meses','Disney+ por siempre'] },
    { name: 'Internet + TV 1000 Mbps', speed_mbps: 1000, price: 209.90, is_featured: false,
      features: ['Velocidad simétrica','1 deco incluido','Movistar TV App x12 meses','Disney+ por siempre'] },
  ],
  claro: [
    { name: 'Internet 200 Mbps',  speed_mbps: 200,  price: 69.00, is_featured: false,
      features: ['Bono 400 Mbps x6 meses','Instalación en 24 horas','Full Claro incluido','Sin costo de instalación'] },
    { name: 'Internet 400 Mbps',  speed_mbps: 400,  price: 1.00,  is_featured: true,
      features: ['Precio promo x2 meses','Bono 1000 Mbps x12 meses','Full Claro incluido','Instalación en 24 horas'] },
    { name: 'Internet 500 Mbps',  speed_mbps: 500,  price: 55.00, is_featured: false,
      features: ['Precio promo x6 meses','Bono 1000 Mbps x12 meses','Full Claro incluido','Instalación en 24 horas'] },
    { name: 'Internet 1000 Mbps', speed_mbps: 1000, price: 99.00, is_featured: false,
      features: ['Precio promo x6 meses','Full Claro incluido','L1 MAX incluido','Instalación en 24 horas'] },
  ],
  win: [
    { name: 'FonoWIN 350 Mbps',           speed_mbps: 350,  price: 59.00, is_featured: false,
      features: ['100% Fibra Óptica','Precio x2 meses S/59','Precio regular S/79','Sin permanencia'] },
    { name: 'Internet 550 Mbps',           speed_mbps: 550,  price: 89.00, is_featured: false,
      features: ['100% Fibra Óptica','Sin permanencia','Instalación gratis','Precio regular S/89'] },
    { name: 'Internet 750 Mbps',           speed_mbps: 750,  price: 99.00, is_featured: true,
      features: ['100% Fibra Óptica','Sin permanencia','Instalación gratis','Precio regular S/99'] },
    { name: 'Internet + WIN TV 1000 Mbps', speed_mbps: 1000, price: 99.90, is_featured: false,
      features: ['100% Fibra Óptica','WIN TV L1 MAX incluido','Más de 90 canales','2 Mesh incluidos'] },
  ],
  wow: [
    { name: 'Internet 500 Mbps',         speed_mbps: 500,  price: 79.90, is_featured: false,
      features: ['WiFi 6 incluido','DGO TV incluido','Velocidad garantizada','Pago puntual x6 meses'] },
    { name: 'Internet 1000 Mbps',        speed_mbps: 1000, price: 84.90, is_featured: false,
      features: ['WiFi 6 incluido','DGO TV incluido','L1 MAX incluido','Pago puntual x6 meses'] },
    { name: 'Internet 1000 Mbps Premium',speed_mbps: 1000, price: 94.90, is_featured: false,
      features: ['WiFi 6 incluido','L1 MAX incluido','DGO TV incluido','Pago puntual x6 meses'] },
    { name: 'Internet 1000 Mbps Promo',  speed_mbps: 1000, price: 99.90, is_featured: true,
      features: ['WiFi 6 incluido','DGO Familia incluido','Liga 1 MAX incluido','Prime Video incluido'] },
  ],
}

async function seed() {
  console.log('\n🌱 Seed MiPlan.pe — operadores y planes reales\n')

  // Upsert operadores
  console.log('📡 Operadores...')
  for (const op of operators) {
    await pool.query(
      `INSERT INTO operators (slug, name, brand_color)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name, brand_color = EXCLUDED.brand_color`,
      [op.slug, op.name, op.brand_color]
    )
    console.log(`  ✅ ${op.name} (${op.slug}) ${op.brand_color}`)
  }

  // Planes
  console.log('\n📋 Planes...')
  for (const [slug, plans] of Object.entries(plansBySlug)) {
    const { rows } = await pool.query('SELECT id FROM operators WHERE slug = $1', [slug])
    if (!rows.length) { console.error(`  ❌ Operador no encontrado: ${slug}`); continue }
    const operatorId = rows[0].id

    for (const p of plans) {
      await pool.query(
        `INSERT INTO plans (operator_id, name, speed_mbps, price, features, is_featured)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [operatorId, p.name, p.speed_mbps, p.price, p.features, p.is_featured]
      )
      console.log(`  ✅ [${slug}] ${p.name} — S/${p.price}${p.is_featured ? ' ⭐' : ''}`)
    }
  }

  // Resumen
  const { rows } = await pool.query(`
    SELECT o.name, COUNT(p.id) AS total, MIN(p.price) AS desde
    FROM operators o LEFT JOIN plans p ON p.operator_id = o.id
    GROUP BY o.name ORDER BY o.name
  `)
  console.log('\n📊 Resumen:')
  rows.forEach(r =>
    console.log(`  ${r.name.padEnd(10)} ${r.total} planes  desde S/${Number(r.desde ?? 0).toFixed(2)}`)
  )
  console.log('\n✅ Seed completado.\n')
  await pool.end()
}

seed().catch((err) => { console.error('❌', err.message); pool.end(); process.exit(1) })
