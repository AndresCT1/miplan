import { useState, useEffect, useRef, useCallback } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSeller } from '../../context/SellerContext'
import { sellerService } from '../../services/api'

const BOTTOM_NAV = [
  { to: '/equipo',               label: 'Inicio',     icon: '🏠', end: true  },
  { to: '/equipo/clientes',      label: 'Clientes',   icon: '👥', end: false },
  { to: '/equipo/prospectos',    label: 'Prospectos', icon: '🎯', end: false },
  { to: '/equipo/catalogo',      label: 'Catálogo',   icon: '📋', end: false },
  { to: '/equipo/perfil',        label: 'Perfil',     icon: '👤', end: false },
]

const SIDEBAR_NAV = [
  { to: '/equipo',               label: 'Dashboard',  icon: '📊', end: true  },
  { to: '/equipo/clientes',      label: 'Clientes',   icon: '👥', end: false },
  { to: '/equipo/prospectos',    label: 'Prospectos', icon: '🎯', end: false },
  { to: '/equipo/catalogo',      label: 'Catálogo',   icon: '📡', end: false },
  { to: '/equipo/nueva-venta',   label: 'Nueva Venta',icon: '➕', end: false },
  { to: '/equipo/perfil',        label: 'Mi Perfil',  icon: '👤', end: false },
]

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]
                    bg-gray-900 text-white text-sm font-medium px-4 py-2.5
                    rounded-xl shadow-lg pointer-events-none animate-fade-up">
      {message}
    </div>
  )
}

// ── A — Modal prospecto rápido ────────────────────────────────────────────────
function QuickProspectModal({ onClose, onSaved }) {
  const [form,    setForm]    = useState({ prospectName: '', prospectPhone: '', operatorId: '' })
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    sellerService.getCatalog()
      .then(data => setCatalog(data ?? []))
      .catch(() => {})
  }, [])

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.prospectName.trim()) { setError('El nombre es requerido'); return }
    if (form.prospectPhone && !/^9\d{8}$/.test(form.prospectPhone)) {
      setError('Celular inválido (9 dígitos, empieza con 9)'); return
    }
    setLoading(true); setError('')
    try {
      await sellerService.createProspect({
        prospectName:  form.prospectName.trim(),
        prospectPhone: form.prospectPhone || undefined,
        operatorId:    form.operatorId ? parseInt(form.operatorId) : undefined,
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl shadow-xl rounded-t-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">➕ Nuevo prospecto rápido</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 pt-4 pb-8 md:pb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text" value={form.prospectName} onChange={set('prospectName')}
              placeholder="Juan Pérez" autoFocus
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
            <input
              type="tel" value={form.prospectPhone} onChange={set('prospectPhone')}
              placeholder="9XXXXXXXX" maxLength={9} inputMode="numeric"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operador de interés</label>
            <select
              value={form.operatorId} onChange={set('operatorId')}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm
                         bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">— Opcional —</option>
              {catalog.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
            </select>
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm
                         font-semibold rounded-xl transition-colors disabled:opacity-50
                         flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando...</>
                : 'Guardar prospecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── C — Búsqueda global ───────────────────────────────────────────────────────
function SearchBar({ onNavigate }) {
  const [open,     setOpen]     = useState(false)
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState(null) // null = sin buscar
  const [loading,  setLoading]  = useState(false)
  const inputRef  = useRef(null)
  const wrapperRef = useRef(null)
  const timerRef  = useRef(null)

  // Cerrar al clicar fuera
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false); setQuery(''); setResults(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    clearTimeout(timerRef.current)
    if (q.trim().length < 2) { setResults(null); return }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      try {
        const data = await sellerService.search(q.trim())
        setResults(data)
      } catch { setResults({ clients: [], prospects: [] }) }
      finally { setLoading(false) }
    }, 300)
  }

  const handleSelect = (path) => {
    setOpen(false); setQuery(''); setResults(null)
    onNavigate(path)
  }

  const STATUS_LABEL = {
    nuevo: 'Nuevo', contactado: 'Contactado', interesado: 'Interesado',
    propuesta: 'Propuesta', cerrado: 'Cerrado', perdido: 'Perdido',
  }

  const hasResults = results && (results.clients?.length > 0 || results.prospects?.length > 0)
  const noResults  = results && !hasResults

  return (
    <div ref={wrapperRef} className="relative">
      {!open ? (
        <button
          onClick={handleOpen}
          aria-label="Buscar"
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleChange}
            placeholder="Buscar cliente o prospecto..."
            className="w-44 sm:w-60 px-3 py-1.5 rounded-xl border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={() => { setOpen(false); setQuery(''); setResults(null) }}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >×</button>
        </div>
      )}

      {/* Dropdown de resultados */}
      {open && (query.length >= 2) && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl
                        shadow-xl border border-gray-100 overflow-hidden z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">Buscando...</div>
          )}

          {!loading && noResults && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No se encontraron resultados para <strong>"{query}"</strong>
            </div>
          )}

          {!loading && hasResults && (
            <div>
              {results.clients?.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">
                    👥 Clientes
                  </p>
                  {results.clients.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelect('/equipo/clientes')}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <p className="text-sm font-medium text-gray-900">{c.client_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {c.client_phone && `📞 ${c.client_phone}`}
                        {c.operator_name && ` · ${c.operator_name}`}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              {results.prospects?.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">
                    🎯 Prospectos
                  </p>
                  {results.prospects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelect('/equipo/prospectos')}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <p className="text-sm font-medium text-gray-900">{p.prospect_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {p.prospect_phone && `📞 ${p.prospect_phone}`}
                        {p.status && ` · ${STATUS_LABEL[p.status] ?? p.status}`}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Layout principal ──────────────────────────────────────────────────────────
export default function SellerLayout() {
  const { seller, logout } = useSeller()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [showFAB,   setShowFAB]   = useState(false) // modal prospecto rápido
  const [toast,     setToast]     = useState('')

  // Ocultar FAB en nueva venta para no confundir
  const hideFAB = location.pathname === '/equipo/nueva-venta'

  const handleLogout = async () => {
    await logout()
    navigate('/equipo/login', { replace: true })
  }

  const handleProspectSaved = useCallback(() => {
    setToast('✅ Prospecto guardado')
    // Si ya estamos en prospectos, recargar
    if (location.pathname === '/equipo/prospectos') {
      window.location.reload()
    }
  }, [location.pathname])

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

          {/* C — Búsqueda global */}
          <div className="ml-auto flex items-center gap-2">
            <SearchBar onNavigate={navigate} />

            {/* Logout mobile */}
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-500
                         transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 md:hidden"
            >
              Salir
            </button>
            <span className="text-xs text-gray-400 hidden md:block">{seller?.name}</span>
          </div>
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
                   border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]
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

      {/* ── A — FAB prospecto rápido ─────────────────────────────────────── */}
      {!hideFAB && (
        <button
          onClick={() => setShowFAB(true)}
          aria-label="Agregar prospecto rápido"
          className="fixed z-40 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700
                     text-white text-3xl font-light shadow-lg
                     transition-all duration-150 hover:scale-105 active:scale-95
                     flex items-center justify-center
                     bottom-20 right-4 md:bottom-6 md:right-6"
        >
          +
        </button>
      )}

      {/* Modales y toast */}
      {showFAB && (
        <QuickProspectModal
          onClose={() => setShowFAB(false)}
          onSaved={handleProspectSaved}
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  )
}
