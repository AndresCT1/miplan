export function respond(res, status, data = null, error = null, pagination = null) {
  const body = { success: !error, data, error }
  if (pagination) body.pagination = pagination
  return res.status(status).json(body)
}
