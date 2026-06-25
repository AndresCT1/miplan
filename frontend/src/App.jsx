import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AdminProvider }   from './context/AdminContext'
import { ChatProvider }    from './context/ChatContext'
import { CompareProvider } from './context/CompareContext'
import { SellerProvider }  from './context/SellerContext'
import ProtectedRoute      from './components/admin/ProtectedRoute'
import AdminLayout         from './components/admin/AdminLayout'
import SellerProtectedRoute from './components/seller/SellerProtectedRoute'
import SellerLayout        from './components/seller/SellerLayout'
import ChatWidget          from './components/chat/ChatWidget'
import PlanCompareBar      from './components/operators/PlanCompareBar'
import ScrollToTop         from './components/ScrollToTop'
import Navbar              from './components/layout/Navbar'

// Public pages
const Home             = lazy(() => import('./pages/Home'))
const OperatorPlans    = lazy(() => import('./pages/OperatorPlans'))
const Contact          = lazy(() => import('./pages/Contact'))
const Compare          = lazy(() => import('./pages/Compare'))
const FeaturedPlans    = lazy(() => import('./pages/FeaturedPlans'))
const About            = lazy(() => import('./pages/About'))
const AllPlans         = lazy(() => import('./pages/AllPlans'))

// Admin pages
const AdminLogin    = lazy(() => import('./pages/admin/Login'))
const Dashboard     = lazy(() => import('./pages/admin/Dashboard'))
const Leads         = lazy(() => import('./pages/admin/Leads'))
const Commissions   = lazy(() => import('./pages/admin/Commissions'))
const AdminSellers  = lazy(() => import('./pages/admin/Sellers'))

// Seller pages
const SellerLogin   = lazy(() => import('./pages/seller/Login'))
const SellerDashboard = lazy(() => import('./pages/seller/Dashboard'))
const SellerCatalog = lazy(() => import('./pages/seller/Catalog'))
const NewSale       = lazy(() => import('./pages/seller/NewSale'))
const MySales       = lazy(() => import('./pages/seller/MySales'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function isPanel(pathname) {
  return pathname.startsWith('/admin') || pathname.startsWith('/equipo')
}

function NavbarGuard() {
  const { pathname } = useLocation()
  if (isPanel(pathname)) return null
  return <Navbar />
}

function ContentWrapper({ children }) {
  const { pathname } = useLocation()
  if (isPanel(pathname)) return children
  return <div className="pt-16">{children}</div>
}

function ChatWidgetGuard() {
  const { pathname } = useLocation()
  if (isPanel(pathname)) return null
  return <ChatWidget />
}

function CompareBarGuard() {
  const { pathname } = useLocation()
  if (isPanel(pathname) || pathname === '/comparar') return null
  return <PlanCompareBar />
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <SellerProvider>
          <CompareProvider>
            <ChatProvider>
              <ScrollToTop />
              <NavbarGuard />
              <Suspense fallback={<PageLoader />}>
                <ContentWrapper>
                  <Routes>
                    {/* Public */}
                    <Route path="/"                      element={<Home />} />
                    <Route path="/operador/:slug"         element={<OperatorPlans />} />
                    <Route path="/contacto"               element={<Contact />} />
                    <Route path="/comparar"               element={<Compare />} />
                    <Route path="/planes-destacados"      element={<FeaturedPlans />} />
                    <Route path="/todos-los-planes"       element={<AllPlans />} />
                    <Route path="/nosotros"               element={<About />} />

                    {/* Admin — public */}
                    <Route path="/admin/login"         element={<AdminLogin />} />

                    {/* Admin — protected */}
                    <Route path="/admin" element={
                      <ProtectedRoute>
                        <AdminLayout />
                      </ProtectedRoute>
                    }>
                      <Route index              element={<Dashboard />} />
                      <Route path="leads"       element={<Leads />} />
                      <Route path="comisiones"  element={<Commissions />} />
                      <Route path="vendedores"  element={<AdminSellers />} />
                    </Route>

                    {/* Seller — public */}
                    <Route path="/equipo/login"        element={<SellerLogin />} />

                    {/* Seller — protected */}
                    <Route path="/equipo" element={
                      <SellerProtectedRoute>
                        <SellerLayout />
                      </SellerProtectedRoute>
                    }>
                      <Route index              element={<SellerDashboard />} />
                      <Route path="ventas"      element={<MySales />} />
                      <Route path="catalogo"    element={<SellerCatalog />} />
                      <Route path="nueva-venta" element={<NewSale />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </ContentWrapper>
                <ChatWidgetGuard />
                <CompareBarGuard />
              </Suspense>
            </ChatProvider>
          </CompareProvider>
        </SellerProvider>
      </AdminProvider>
    </BrowserRouter>
  )
}
