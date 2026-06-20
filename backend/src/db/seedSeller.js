import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { pool } from './connection.js'

const SELLER = {
  name:     'Vendedor Demo',
  email:    'vendedor@miplan.pe',
  password: 'vendedor123',
}

async function seed() {
  const hash = await bcrypt.hash(SELLER.password, 12)
  const { rows } = await pool.query(
    `INSERT INTO sellers (name, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING id, email`,
    [SELLER.name, SELLER.email, hash]
  )
  console.log('✅ Vendedor creado:', rows[0])
  await pool.end()
}

seed().catch((err) => { console.error(err); process.exit(1) })
