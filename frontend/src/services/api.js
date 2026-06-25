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
  getByOperator: (id)    => api.get(`/plans/${id}`),
  compare:       (ids)   => api.get(`/plans/compare?ids=${ids.join(',')}`),
  getFeatured:   ()      => api.get('/plans/featured'),
  getAll:        (params)=> api.get('/plans/all', { params }),
  recordView:    (id)    => api.post(`/plans/${id}/view`),
}

export const leadsService = {
  create: (data) => api.post('/leads', data),
}

export const chatService = {
  sendMessage: (message, history = []) => api.post('/chat', { message, history }),
}

export const adminService = {
  login:              (creds)   => api.post('/admin/login', creds),
  logout:             ()        => api.post('/admin/logout'),
  getMe:              ()        => api.get('/admin/me'),
  getLeads:           (params)  => api.get('/admin/leads', { params }),
  updateStatus:       (id, s)   => api.put(`/admin/leads/${id}/status`, { status: s }),
  getStats:           ()        => api.get('/admin/stats'),
  getCommissions:     ()        => api.get('/admin/commissions'),
  updateCommission:   (id, pct) => api.put(`/admin/commissions/${id}`, { commission_pct: pct }),
  getSellers:         ()           => api.get('/admin/sellers'),
  createSeller:       (data)       => api.post('/admin/sellers', data),
  updateSeller:       (id, data)   => api.put(`/admin/sellers/${id}`, data),
  resetSellerPassword:(id, pwd)    => api.put(`/admin/sellers/${id}/reset-password`, { newPassword: pwd }),
  deactivateSeller:   (id)         => api.delete(`/admin/sellers/${id}`),
  // Client commissions
  getAllClients:       (params)     => api.get('/admin/clients', { params }),
  markCommissionPaid: (id)         => api.put(`/admin/clients/${id}/commission-status`),
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
  // Profile
  getProfile:     ()        => api.get('/seller/profile'),
  updateProfile:  (data)    => api.put('/seller/profile', data),
  testNotification: ()      => api.post('/seller/profile/test-notification'),
  // Clients
  getClients:     (params)  => api.get('/seller/clients', { params }),
  createClient:   (data)    => api.post('/seller/clients', data),
  getClientStats: ()        => api.get('/seller/clients/stats'),
  updateClientNotes: (id, notes) => api.put(`/seller/clients/${id}/notes`, { notes }),
  // Prospects
  getProspects:   (params)  => api.get('/seller/prospects', { params }),
  createProspect: (data)    => api.post('/seller/prospects', data),
  updateProspectStatus:     (id, status) => api.put(`/seller/prospects/${id}/status`, { status }),
  updateProspectNextContact:(id, date)   => api.put(`/seller/prospects/${id}/next-contact`, { date }),
  incrementAttempt:         (id)         => api.put(`/seller/prospects/${id}/attempt`),
  convertProspect:          (id, data)   => api.post(`/seller/prospects/${id}/convert`, data),
}

export default api
