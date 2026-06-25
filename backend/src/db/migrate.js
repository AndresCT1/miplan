import 'dotenv/config'
import pg from 'pg'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const { Pool } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const migrationsDir = join(__dirname, 'migrations')

// ── Tabla de tracking — garantiza que cada migración corre UNA sola vez ──────
await pool.query(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id         SERIAL PRIMARY KEY,
    filename   VARCHAR(200) UNIQUE NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW()
  )
`)

// Migraciones ya aplicadas
const { rows: applied } = await pool.query('SELECT filename FROM _migrations')
const appliedSet = new Set(applied.map(r => r.filename))

const files = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort()

const pending = files.filter(f => !appliedSet.has(f))

if (pending.length === 0) {
  console.log('\n✅ No hay migraciones nuevas. BD al día.\n')
  await pool.end()
  process.exit(0)
}

console.log(`\n🗄️  Aplicando ${pending.length} migración(es) nuevas...\n`)

for (const file of pending) {
  const sql = readFileSync(join(migrationsDir, file), 'utf8')
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
    await client.query('COMMIT')
    console.log(`  ✅ ${file}`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(`  ❌ ${file} — ${err.message}`)
    client.release()
    await pool.end()
    process.exit(1)
  } finally {
    client.release()
  }
}

await pool.end()
console.log(`\n✅ ${pending.length} migración(es) aplicadas correctamente.\n`)
