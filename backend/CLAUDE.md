# Agente Backend — Node.js API Expert

## Identidad
Eres el desarrollador backend senior. Construyes APIs REST robustas, bien
estructuradas y con manejo de errores exhaustivo. Cada capa tiene una sola
responsabilidad. El código es predecible y fácil de mantener.

## Stack y versiones
```json
{
  "node":                ">=20 LTS",
  "express":             "^4.19",
  "pg":                  "^8.12",
  "bcryptjs":            "^2.4",
  "jsonwebtoken":        "^9.0",
  "express-rate-limit":  "^7.4",
  "cors":                "^2.8",
  "dotenv":              "^16.4",
  "express-validator":   "^7.2",
  "helmet":              "^7.1"
}
```

## Arquitectura de capas
```
routes/      → Declaran endpoints, adjuntan middleware, llaman al controller
controllers/ → Reciben req/res, llaman services, responden. Sin lógica de negocio.
services/    → Toda la lógica de negocio. Usan funciones de db/queries/.
db/queries/  → SQL puro. Una función por query. Parámetros siempre con $1, $2...
middleware/  → auth, validate, rateLimiter, errorHandler
utils/       → respond(), sanitize(), etc.
```

## Ejemplo completo — flujo de un lead

```js
// routes/leads.js
import { Router }         from 'express'
import { createLead }     from '../controllers/leadController.js'
import { validateLead }   from '../middleware/validate.js'
import { leadsLimiter }   from '../middleware/rateLimiter.js'

const router = Router()
router.post('/', leadsLimiter, validateLead, createLead)
export default router

// controllers/leadController.js
import { leadService } from '../services/leadService.js'
import { respond }     from '../utils/respond.js'

export async function createLead(req, res) {
  try {
    const lead = await leadService.create(req.body)
    respond(res, 201, lead)
  } catch (err) {
    respond(res, 500, null, err.message)
  }
}

// services/leadService.js
import { insertLead }        from '../db/queries/leads.js'
import { telegramService }   from './telegramService.js'

export const leadService = {
  async create(data) {
    const lead = await insertLead(data)
    await telegramService.notifyNewLead(lead)
    return lead
  }
}

// db/queries/leads.js
import { pool } from '../connection.js'

export async function insertLead({ dni, name, address, phone, operatorId, planId }) {
  const { rows } = await pool.query(
    `INSERT INTO leads (dni, name, address, phone, operator_id, plan_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending')
     RETURNING *`,
    [dni, name, address, phone, operatorId, planId]
  )
  return rows[0]
}
```

## Utilidades base

### utils/respond.js — respuesta estándar (inmutable)
```js
export function respond(res, status, data = null, error = null) {
  res.status(status).json({ success: !error, data, error })
}
```

### db/connection.js
```js
import pg from 'pg'
const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: { rejectUnauthorized: false }, // Neon.tech requiere SSL siempre
})
```

## Servicios externos

### services/telegramService.js
```js
const BASE = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`

export const telegramService = {
  async notifyNewLead(lead) {
    const text = [
      '🔔 *Nuevo cliente interesado*',
      `👤 DNI: ${lead.dni}`,
      `📛 Nombre: ${lead.name}`,
      `📍 Dirección: ${lead.address}`,
      `📱 Celular: ${lead.phone}`,
      `📡 Operador: ${lead.operator_name ?? lead.operator_id}`,
      `💼 Plan: ${lead.plan_name ?? lead.plan_id}`,
      `🕐 ${new Date().toLocaleString('es-PE')}`,
    ].join('\n')

    const res = await fetch(`${BASE}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown'
      })
    })
    if (!res.ok) console.error('Telegram error:', await res.text())
  },

  async notifyFollowupReminder(lead) {
    const text = `⏰ *Recordatorio*\n${lead.name} lleva más de 24h sin contactar.\n📱 ${lead.phone}`
    await fetch(`${BASE}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown'
      })
    })
  }
}
```

### services/geminiService.js
```js
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

export const geminiService = {
  async chat(messages, availablePlans) {
    const systemPrompt = `Eres un asesor de internet amigable y experto.
Tu objetivo es entender las necesidades del cliente con máximo 4 preguntas
y recomendar el plan más adecuado entre los disponibles.

Planes disponibles:
${JSON.stringify(availablePlans, null, 2)}

Al terminar, pregunta si desea que un asesor lo contacte.
Responde siempre en español, de forma concisa y amigable.`

    // Gemini usa "contents" con roles "user" / "model"
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Entendido, estoy listo para asesorar.' }] },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    ]

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 500 } }),
    })
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`)
    const json = await res.json()
    return json.candidates[0].content.parts[0].text
  }
}
```

## Middleware

### middleware/validate.js
```js
import { body, validationResult } from 'express-validator'

export const validateLead = [
  body('dni').matches(/^\d{8}$/).withMessage('DNI debe tener 8 dígitos'),
  body('phone').matches(/^9\d{8}$/).withMessage('Celular inválido'),
  body('name').trim().isLength({ min: 3 }).withMessage('Nombre muy corto'),
  body('address').trim().isLength({ min: 10 }).withMessage('Dirección muy corta'),
  body('operatorId').isInt({ min: 1 }).withMessage('Operador inválido'),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false, data: null,
        error: errors.array()[0].msg
      })
    }
    next()
  }
]
```

### middleware/rateLimiter.js
```js
import rateLimit from 'express-rate-limit'

export const leadsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  message: { success: false, error: 'Demasiadas solicitudes. Intenta en 15 minutos.' }
})
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, max: 20,
  message: { success: false, error: 'Límite de mensajes alcanzado.' }
})
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  skipSuccessfulRequests: true,
  message: { success: false, error: 'Demasiados intentos. Espera 15 minutos.' }
})
```

### middleware/auth.js
```js
import jwt from 'jsonwebtoken'
import { respond } from '../utils/respond.js'

export function requireAuth(req, res, next) {
  const token = req.cookies?.adminToken
  if (!token) return respond(res, 401, null, 'No autorizado')
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    respond(res, 401, null, 'Sesión expirada')
  }
}
```

## Migraciones de base de datos
Archivos numerados en db/migrations/. NUNCA modificar migraciones existentes.

```sql
-- 001_create_operators.sql
CREATE TABLE IF NOT EXISTS operators (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(50) UNIQUE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  logo_url    TEXT,
  brand_color CHAR(7),
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 002_create_plans.sql
CREATE TABLE IF NOT EXISTS plans (
  id          SERIAL PRIMARY KEY,
  operator_id INT REFERENCES operators(id) ON DELETE CASCADE,
  name        VARCHAR(150) NOT NULL,
  speed_mbps  INT NOT NULL,
  price       NUMERIC(8,2) NOT NULL,
  features    TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 003_create_leads.sql
CREATE TABLE IF NOT EXISTS leads (
  id          SERIAL PRIMARY KEY,
  dni         CHAR(8) NOT NULL,
  name        VARCHAR(200) NOT NULL,
  address     TEXT NOT NULL,
  phone       CHAR(9) NOT NULL,
  operator_id INT REFERENCES operators(id),
  plan_id     INT REFERENCES plans(id),
  status      VARCHAR(20) DEFAULT 'pending'
              CHECK (status IN ('pending','contacted','interested','closed','lost')),
  chat_summary TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 004_create_chat_sessions.sql
CREATE TABLE IF NOT EXISTS chat_sessions (
  id             SERIAL PRIMARY KEY,
  lead_id        INT REFERENCES leads(id),
  messages       JSONB NOT NULL DEFAULT '[]',
  recommendation VARCHAR(200),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 005_create_admin_users.sql
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(200) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

## Variables de entorno requeridas (.env)
```env
NODE_ENV=development
PORT=3001
# DATABASE_URL viene de Neon.tech, formato:
# postgresql://user:pass@ep-xxx.neon.tech/miplan?sslmode=require
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/miplan?sslmode=require
JWT_SECRET=cambiar_por_secreto_largo_y_aleatorio_minimo_32_chars
TELEGRAM_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=123456789
GEMINI_API_KEY=tu-key-de-aistudio.google.com
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
```

## Verificación al arrancar — falla rápido si falta variable
```js
// app.js — primeras líneas antes de cualquier otra cosa
const REQUIRED_ENV = [
  'DATABASE_URL','JWT_SECRET','TELEGRAM_TOKEN',
  'TELEGRAM_CHAT_ID','GEMINI_API_KEY','FRONTEND_URL'
]
const missing = REQUIRED_ENV.filter(k => !process.env[k])
if (missing.length) {
  console.error('❌ Variables de entorno faltantes:', missing.join(', '))
  process.exit(1)
}
```
