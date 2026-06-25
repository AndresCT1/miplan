import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'

const NAV = [
  { to: '/admin',                      label: 'Dashboard',  icon: '📊', end: true  },
  { to: '/admin/leads',                label: 'Leads',      icon: '👥', end: false },
  { to: '/admin/comisiones',           label: 'Comisiones', icon: '💰', end: false },
  { to: '/admin/vendedores',           label: 'Vendedores', icon: '🧑‍💼', end: false },
  { to: '/admin/comisiones-clientes',  label: 'Pagos',      icon: '💸', end: false },
]

export default function AdminLayout() {
  const { admin, logout }      = useAdmin()
  const navigate                = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-gray-700 text-white'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Overlay mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 flex flex-col
                    transform transition-transform duration-200 ease-in-out
                    ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:relative md:translate-x-0`}
      >
        {/* Brand */}
        <div className="px-6 py-5 border-b border-gray-800">
          <span className="text-white font-bold text-lg tracking-tight">
            MiPlan <span className="text-blue-400">Admin</span>
          </span>
          {admin?.email && (
            <p className="text-gray-500 text-xs mt-1 truncate">{admin.email}</p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}
              onClick={() => setMenuOpen(false)}>
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <button
            className="md:hidden text-gray-500 hover:text-gray-800"
            onClick={() => setMenuOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-gray-800 font-semibold text-sm">MiPlan.pe</span>
          <span className="ml-auto text-xs text-gray-400">{admin?.email}</span>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
