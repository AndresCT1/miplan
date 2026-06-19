import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AdminProvider }   from './context/AdminContext'
import { ChatProvider }    from './context/ChatContext'
import { CompareProvider } from './context/CompareContext'
import ProtectedRoute      from './components/admin/ProtectedRoute'
import AdminLayout         from './components/admin/AdminLayout'
import ChatWidget          from './components/chat/ChatWidget'
import PlanCompareBar      from './components/operators/PlanCompareBar'
import ScrollToTop         from './components/ScrollToTop'

// Public pages
const Home          = lazy(() => import('./pages/Home'))
const OperatorPlans = lazy(() => import('./pages/OperatorPlans'))
const Contact       = lazy(() => import('./pages/Contact'))
const Compare       = lazy(() => import('./pages/Compare'))

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

function ChatWidgetGuard() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null
  return <ChatWidget />
}

function CompareBarGuard() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin') || pathname === '/comparar') return null
  return <PlanCompareBar />
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <CompareProvider>
          <ChatProvider>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public */}
                <Route path="/"               element={<Home />} />
                <Route path="/operador/:slug" element={<OperatorPlans />} />
                <Route path="/contacto"       element={<Contact />} />
                <Route path="/comparar"       element={<Compare />} />

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
              <ChatWidgetGuard />
              <CompareBarGuard />
            </Suspense>
          </ChatProvider>
        </CompareProvider>
      </AdminProvider>
    </BrowserRouter>
  )
}
