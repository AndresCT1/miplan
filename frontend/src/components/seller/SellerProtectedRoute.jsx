import { Navigate } from 'react-router-dom'
import { useSeller } from '../../context/SellerContext'

export default function SellerProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useSeller()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/equipo/login" replace />
  return children
}
