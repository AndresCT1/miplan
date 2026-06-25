import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { getAllTodayFollowUpsWithSellers } from './db/queries/sellerProspects.js'
import { sellerNotificationService }       from './services/sellerNotificationService.js'
import operatorsRouter    from './routes/operators.js'
import plansRouter        from './routes/plans.js'
import leadsRouter        from './routes/leads.js'
import adminRouter        from './routes/admin.js'
import chatRouter         from './routes/chat.js'
import commissionsRouter  from './routes/commissions.js'
import sellerRouter       from './routes/seller.js'
import { errorHandler }   from './middleware/errorHandler.js'

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
  console.error('   Configura estas variables en Railway → Variables')
  process.exit(1)
}

console.log('✅ Variables de entorno OK')

// Variables opcionales — warning sin detener el proceso
const OPTIONAL_ENV = ['CALLMEBOT_PHONE', 'CALLMEBOT_APIKEY']
const missingOptional = OPTIONAL_ENV.filter((k) => !process.env[k])
if (missingOptional.length) {
  console.warn('⚠️  Variables opcionales no configuradas:', missingOptional.join(', '))
  console.warn('   Las notificaciones por WhatsApp (CallMeBot) estarán desactivadas.')
}

const app = express()

app.set('trust proxy', 1)

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
app.use('/api/operators',           operatorsRouter)
app.use('/api/plans',               plansRouter)
app.use('/api/leads',               leadsRouter)
app.use('/api/admin',               adminRouter)
app.use('/api/chat',                chatRouter)
app.use('/api/admin/commissions',   commissionsRouter)
app.use('/api/seller',              sellerRouter)

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
const server = app.listen(PORT, () => {
  console.log(`🚀 MiPlan.pe API corriendo en puerto ${PORT}`)
  console.log(`   NODE_ENV=${process.env.NODE_ENV ?? 'development'}`)
})

// ── Cron: recordatorios WhatsApp 8am ─────────────────────────────────────────
async function runFollowUpNotifications() {
  try {
    const followUps = await getAllTodayFollowUpsWithSellers()
    console.log(`[Cron] Enviando ${followUps.length} recordatorios de seguimiento`)
    await Promise.allSettled(
      followUps.map(row =>
        sellerNotificationService.notifyFollowUp(
          { phone: row.seller_phone, callmebot_apikey: row.callmebot_apikey, name: row.seller_name },
          { prospect_name: row.prospect_name, prospect_phone: row.prospect_phone,
            next_contact_date: row.next_contact_date, operator_name: row.operator_name,
            plan_name: row.plan_name }
        )
      )
    )
  } catch (err) {
    console.error('[Cron] Error en notificaciones:', err.message)
  }
}

function scheduleFollowUpCron() {
  const now    = new Date()
  const next8  = new Date(now)
  next8.setUTCHours(13, 0, 0, 0)  // 13:00 UTC = 08:00 hora Perú (UTC-5)
  if (next8 <= now) next8.setUTCDate(next8.getUTCDate() + 1)

  const msUntil8 = next8 - now
  console.log(`[Cron] Recordatorios programados en ${Math.round(msUntil8 / 60000)} min`)

  setTimeout(() => {
    runFollowUpNotifications()
    setInterval(runFollowUpNotifications, 24 * 60 * 60 * 1000)
  }, msUntil8)
}

scheduleFollowUpCron()

// Graceful shutdown — Railway envía SIGTERM antes de reemplazar el contenedor
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido — cerrando servidor...')
  server.close(() => {
    console.log('Servidor cerrado correctamente')
    process.exit(0)
  })
})

export default app
