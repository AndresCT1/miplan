import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.response.use(
  (res) => res.data.data,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Error de conexión'
    return Promise.reject(new Error(message))
  }
)

export const operatorsService = {
  getAll: () => api.get('/operators'),
}

export const plansService = {
  getByOperator: (id) => api.get(`/plans/${id}`),
  compare: (ids)      => api.get(`/plans/compare?ids=${ids.join(',')}`),
  getFeatured: ()     => api.get('/plans/featured'),
  recordView: (id)    => api.post(`/plans/${id}/view`),
}

export const leadsService = {
  create: (data) => api.post('/leads', data),
}

export const chatService = {
  sendMessage: (message, history = []) => api.post('/chat', { message, history }),
}

export const adminService = {
  login:              (creds)  => api.post('/admin/login', creds),
  logout:             ()       => api.post('/admin/logout'),
  getMe:              ()       => api.get('/admin/me'),
  getLeads:           (params) => api.get('/admin/leads', { params }),
  updateStatus:       (id, s)  => api.put(`/admin/leads/${id}/status`, { status: s }),
  getStats:           ()       => api.get('/admin/stats'),
  getCommissions:     ()       => api.get('/admin/commissions'),
  updateCommission:   (id, pct) => api.put(`/admin/commissions/${id}`, { commission_pct: pct }),
}

export const sellerService = {
  login:          (creds)   => api.post('/seller/login', creds),
  logout:         ()        => api.post('/seller/logout'),
  getMe:          ()        => api.get('/seller/me'),
  getDashboard:   ()        => api.get('/seller/dashboard'),
  getCatalog:     ()        => api.get('/seller/catalog'),
  getSales:       (params)  => api.get('/seller/sales', { params }),
  createSale:     (data)    => api.post('/seller/sales', data),
  updateSale:     (id, data)=> api.put(`/seller/sales/${id}`, data),
  markContacted:  (id)      => api.post(`/seller/sales/${id}/contacted`),
}

export default api
