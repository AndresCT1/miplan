import 'dotenv/config'
import pg      from 'pg'
import bcrypt  from 'bcryptjs'

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const EMAIL    = 'admin@miplan.pe'
const PASSWORD = 'Admin2025!'

const hash = await bcrypt.hash(PASSWORD, 12)

const { rowCount } = await pool.query(
  `INSERT INTO admin_users (email, password_hash)
   VALUES ($1, $2)
   ON CONFLICT (email) DO NOTHING`,
  [EMAIL, hash]
)

if (rowCount > 0) {
  console.log(`✅ Admin creado: ${EMAIL}`)
} else {
  console.log(`ℹ️  Admin ya existe: ${EMAIL} (sin cambios)`)
}

await pool.end()
