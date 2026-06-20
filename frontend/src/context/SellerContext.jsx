import { createContext, useContext, useState, useEffect } from 'react'
import { sellerService } from '../services/api'

const SellerContext = createContext(null)

export function SellerProvider({ children }) {
  const [seller,          setSeller]  = useState(null)
  const [isAuthenticated, setIsAuth]  = useState(false)
  const [loading,         setLoading] = useState(true)

  useEffect(() => {
    sellerService.getMe()
      .then((data) => { setSeller(data); setIsAuth(true) })
      .catch(()    => { setSeller(null); setIsAuth(false) })
      .finally(()  => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await sellerService.login({ email, password })
    setSeller(data)
    setIsAuth(true)
    return data
  }

  const logout = async () => {
    await sellerService.logout().catch(() => {})
    setSeller(null)
    setIsAuth(false)
  }

  return (
    <SellerContext.Provider value={{ seller, isAuthenticated, loading, login, logout }}>
      {children}
    </SellerContext.Provider>
  )
}

export function useSeller() {
  const ctx = useContext(SellerContext)
  if (!ctx) throw new Error('useSeller must be used within SellerProvider')
  return ctx
}
