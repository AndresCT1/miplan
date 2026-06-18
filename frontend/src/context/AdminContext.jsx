import { createContext, useContext, useState, useEffect } from 'react'
import { adminService } from '../services/api'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [admin,           setAdmin]   = useState(null)
  const [isAuthenticated, setIsAuth]  = useState(false)
  const [loading,         setLoading] = useState(true)

  // Verify session on mount via /api/admin/me
  useEffect(() => {
    adminService.getMe()
      .then((data) => { setAdmin(data); setIsAuth(true) })
      .catch(()    => { setAdmin(null); setIsAuth(false) })
      .finally(()  => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await adminService.login({ email, password })
    setAdmin(data)
    setIsAuth(true)
    return data
  }

  const logout = async () => {
    await adminService.logout().catch(() => {})
    setAdmin(null)
    setIsAuth(false)
  }

  return (
    <AdminContext.Provider value={{ admin, isAuthenticated, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
