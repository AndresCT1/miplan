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
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort()

console.log(`\n🗄️  Ejecutando ${files.length} migraciones contra Neon.tech...\n`)

for (const file of files) {
  const sql = readFileSync(join(migrationsDir, file), 'utf8')
  try {
    await pool.query(sql)
    console.log(`  ✅ ${file}`)
  } catch (err) {
    if (err.code === '42P07') {
      console.log(`  ⚠️  ${file} — tabla ya existe, ignorando`)
    } else {
      console.error(`  ❌ ${file} — ${err.message}`)
      await pool.end()
      process.exit(1)
    }
  }
}

await pool.end()
console.log('\n✅ Migraciones completadas.\n')
