import pg from 'pg'
const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: { rejectUnauthorized: false }, // Neon.tech requiere SSL siempre
})

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message)
})
