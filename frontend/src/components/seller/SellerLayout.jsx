import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useSeller } from '../../context/SellerContext'

const BOTTOM_NAV = [
  { to: '/equipo',             label: 'Inicio',   icon: '🏠', end: true  },
  { to: '/equipo/ventas',      label: 'Ventas',   icon: '💼', end: false },
  { to: '/equipo/catalogo',    label: 'Catálogo', icon: '📋', end: false },
  { to: '/equipo/nueva-venta', label: 'Nueva',    icon: '➕', end: false },
]

const SIDEBAR_NAV = [
  { to: '/equipo',             label: 'Dashboard',  icon: '📊', end: true  },
  { to: '/equipo/ventas',      label: 'Mis Ventas', icon: '💼', end: false },
  { to: '/equipo/catalogo',    label: 'Catálogo',   icon: '📡', end: false },
  { to: '/equipo/nueva-venta', label: 'Nueva Venta',icon: '➕', end: false },
]

export default function SellerLayout() {
  const { seller, logout } = useSeller()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/equipo/login', { replace: true })
  }

  const sidebarLink = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive ? 'bg-green-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* ── Sidebar — solo desktop ──────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-5 border-b border-gray-800">
          <span className="text-white font-bold text-lg tracking-tight">
            MiPlan <span className="text-green-400">Equipo</span>
          </span>
          {seller?.name && (
            <p className="text-gray-400 text-xs mt-1 truncate">{seller.name}</p>
          )}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {SIDEBAR_NAV.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} className={sidebarLink}>
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                       text-gray-400 hover:bg-gray-800 hover:text-red-400
                       text-sm font-medium transition-colors duration-150"
          >
            <span>🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Área principal ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3
                           flex items-center gap-3 sticky top-0 z-10">
          <span className="text-gray-800 font-semibold text-sm">
            MiPlan <span className="text-green-600">Equipo</span>
          </span>
          {seller?.name && (
            <span className="text-gray-400 text-xs hidden sm:block truncate">
              · {seller.name}
            </span>
          )}
          {/* Logout — solo visible en mobile donde no hay sidebar */}
          <button
            onClick={handleLogout}
            className="ml-auto text-xs text-gray-400 hover:text-red-500
                       transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50
                       md:hidden"
          >
            Salir
          </button>
          <span className="ml-auto text-xs text-gray-400 hidden md:block">
            {seller?.name}
          </span>
        </header>

        {/* Contenido — pb-24 en mobile para bottom nav */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Bottom navigation — solo mobile ─────────────────────────────── */}
      <nav
        aria-label="Navegación principal"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-white
                   border-t border-gray-200
                   shadow-[0_-2px_12px_rgba(0,0,0,0.08)]
                   flex items-stretch"
      >
        {BOTTOM_NAV.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5
               text-xs font-medium transition-colors duration-150
               ${isActive ? 'text-green-600' : 'text-gray-400'}`
            }
          >
            <span className="text-xl leading-none">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
