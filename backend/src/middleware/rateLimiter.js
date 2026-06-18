import rateLimit from 'express-rate-limit'

export const leadsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, error: 'Demasiadas solicitudes. Intenta en 15 minutos.' },
})

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, error: 'Límite de mensajes alcanzado.' },
})

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, error: 'Demasiados intentos. Espera 15 minutos.' },
})
