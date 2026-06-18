export function errorHandler(err, _req, res, _next) {
  const isProd = process.env.NODE_ENV === 'production'
  console.error(`[${new Date().toISOString()}]`, err)
  res.status(err.status || 500).json({
    success: false,
    data: null,
    error: isProd ? 'Error interno del servidor' : err.message,
  })
}
