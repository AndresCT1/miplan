import { Navigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdmin()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}
