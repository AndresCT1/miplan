import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import operatorsRouter from './routes/operators.js'
import plansRouter     from './routes/plans.js'
import leadsRouter     from './routes/leads.js'
import adminRouter     from './routes/admin.js'
import chatRouter      from './routes/chat.js'
import { errorHandler } from './middleware/errorHandler.js'

const REQUIRED_ENV = [
  'DATABASE_URL',
  'JWT_SECRET',
  'TELEGRAM_TOKEN',
  'TELEGRAM_CHAT_ID',
  'GEMINI_API_KEY',
  'FRONTEND_URL',
]
const missing = REQUIRED_ENV.filter((k) => !process.env[k])
if (missing.length) {
  console.error('❌ Variables de entorno faltantes:', missing.join(', '))
  process.exit(1)
}

const app = express()

// ── Seguridad ────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'https://generativelanguage.googleapis.com'],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}))

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [process.env.FRONTEND_URL]
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(new Error('CORS no permitido'))
  },
  credentials: true,
}))

app.use(express.json())
app.use(cookieParser())

// ── Rutas ────────────────────────────────────────────────────────────────────
app.use('/api/operators', operatorsRouter)
app.use('/api/plans',     plansRouter)
app.use('/api/leads',     leadsRouter)
app.use('/api/admin',     adminRouter)
app.use('/api/chat',      chatRouter)

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' }, error: null })
})

// ── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, error: 'Ruta no encontrada' })
})

// ── Error handler (debe ser el último middleware) ────────────────────────────
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 MiPlan.pe API corriendo en http://localhost:${PORT}`)
})

export default app
