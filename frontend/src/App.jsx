import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminProvider } from './context/AdminContext'
import ProtectedRoute   from './components/admin/ProtectedRoute'
import AdminLayout      from './components/admin/AdminLayout'

// Public pages
const Home          = lazy(() => import('./pages/Home'))
const OperatorPlans = lazy(() => import('./pages/OperatorPlans'))
const Contact       = lazy(() => import('./pages/Contact'))

// Admin pages
const AdminLogin    = lazy(() => import('./pages/admin/Login'))
const Dashboard     = lazy(() => import('./pages/admin/Dashboard'))
const Leads         = lazy(() => import('./pages/admin/Leads'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"               element={<Home />} />
            <Route path="/operador/:slug" element={<OperatorPlans />} />
            <Route path="/contacto"       element={<Contact />} />

            {/* Admin — public */}
            <Route path="/admin/login"    element={<AdminLogin />} />

            {/* Admin — protected, nested under AdminLayout */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index        element={<Dashboard />} />
              <Route path="leads" element={<Leads />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AdminProvider>
    </BrowserRouter>
  )
}
