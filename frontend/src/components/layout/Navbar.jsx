import { useState, useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useCompare } from '../../context/CompareContext'
import { useChat as useChatContext } from '../../context/ChatContext'

const OPERATORS = [
  { name: 'Claro',    slug: 'claro',    color: '#DA291C' },
  { name: 'Movistar', slug: 'movistar', color: '#00A8E0' },
  { name: 'WOW',      slug: 'wow',      color: '#9B59B6' },
  { name: 'WIN',      slug: 'win',      color: '#FF6B00' },
  { name: 'Mi Fibra', slug: 'mifibra',  color: '#E91E8C' },
]

function HamburgerIcon({ open }) {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" strokeWidth={2} aria-hidden="true">
      {open
        ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      }
    </svg>
  )
}

export default function Navbar() {
  const navigate          = useNavigate()
  const { pathname }      = useLocation()
  const { selectedPlans } = useCompare()
  const { setIsOpen }     = useChatContext()
  const [menuOpen,       setMenuOpen]       = useState(false)
  const [operatorsOpen,  setOperatorsOpen]  = useState(false)

  const closeMenu = () => { setMenuOpen(false); setOperatorsOpen(false) }

  const goToOperators = useCallback(() => {
    closeMenu()
    if (pathname === '/') {
      document.getElementById('operadores')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        document.getElementById('operadores')?.scrollIntoView({ behavior: 'smooth' })
      }, 400)
    }
  }, [pathname, navigate])

  const goToComparar = useCallback(() => {
    closeMenu()
    navigate('/comparar')
  }, [navigate])

  const openChat = useCallback(() => {
    closeMenu()
    setIsOpen(true)
  }, [setIsOpen])

  const isActive = (path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)

  const linkClass = (path) =>
    `text-sm font-medium transition-colors duration-150 pb-0.5
     ${isActive(path)
       ? 'text-blue-600 border-b-2 border-blue-600'
       : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'}`

  return (
    <>
      {/* ── Navbar principal ──────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm
                         border-b border-gray-100 shadow-sm h-16">
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="text-blue-600 font-extrabold text-xl tracking-tight
                                   flex-shrink-0">
            MiPlan<span className="text-gray-900">.pe</span>
          </Link>

          {/* ── Desktop nav ────────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navegación principal">
            <Link to="/" className={linkClass('/')}>Inicio</Link>

            <button onClick={goToOperators}
                    className={`text-sm font-medium transition-colors duration-150 pb-0.5
                                border-b-2
                                ${pathname.startsWith('/operador')
                                  ? 'text-blue-600 border-blue-600'
                                  : 'text-gray-600 hover:text-gray-900 border-transparent'}`}>
              Operadores
            </button>

            <Link to="/todos-los-planes" className={linkClass('/todos-los-planes')}>
              Todos los planes
            </Link>

            <button onClick={goToComparar}
                    className={`relative text-sm font-medium transition-colors duration-150 pb-0.5
                                border-b-2
                                ${isActive('/comparar')
                                  ? 'text-blue-600 border-blue-600'
                                  : 'text-gray-600 hover:text-gray-900 border-transparent'}`}>
              Comparar
              {selectedPlans.length > 0 && (
                <span className="absolute -top-2 -right-3 w-4 h-4 bg-blue-600 text-white
                                 text-[9px] font-bold rounded-full flex items-center justify-center">
                  {selectedPlans.length}
                </span>
              )}
            </button>

            <Link to="/nosotros" className={linkClass('/nosotros')}>Nosotros</Link>
            <Link to="/contacto" className={linkClass('/contacto')}>Contacto</Link>
          </nav>

          {/* CTA desktop + hamburguesa mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={openChat}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl
                         border-2 border-blue-600 text-blue-600 text-sm font-semibold
                         hover:bg-blue-50 transition-colors duration-150 min-h-[40px]"
            >
              💬 Hablar con asesor
            </button>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              className="md:hidden p-2 text-gray-700 hover:text-gray-900
                         transition-colors min-h-[44px] min-w-[44px]
                         flex items-center justify-center"
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Overlay mobile ────────────────────────────────────────────────── */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* ── Menú mobile desplegable ───────────────────────────────────────── */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 md:hidden bg-white
                    border-b border-gray-100 shadow-lg
                    transform transition-all duration-300 ease-out
                    ${menuOpen
                      ? 'translate-y-0 opacity-100 pointer-events-auto'
                      : '-translate-y-3 opacity-0 pointer-events-none'}`}
        aria-hidden={!menuOpen}
      >
        <nav className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-1"
             aria-label="Navegación mobile">

          <Link to="/" onClick={closeMenu}
                className={`px-3 py-3 rounded-xl text-base font-medium
                            min-h-[48px] flex items-center transition-colors
                            ${pathname === '/'
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'}`}>
            🏠 Inicio
          </Link>

          {/* Operadores con sub-lista */}
          <div>
            <button
              onClick={() => setOperatorsOpen((v) => !v)}
              className={`w-full px-3 py-3 rounded-xl text-base font-medium
                          min-h-[48px] flex items-center justify-between transition-colors
                          ${pathname.startsWith('/operador')
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <span>📡 Operadores</span>
              <svg className={`w-4 h-4 transition-transform duration-200
                               ${operatorsOpen ? 'rotate-180' : ''}`}
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {operatorsOpen && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-gray-100 pl-3">
                <button onClick={goToOperators}
                        className="px-3 py-2 text-sm text-gray-500 hover:text-blue-600
                                   text-left transition-colors">
                  Ver todos los operadores
                </button>
                {OPERATORS.map(({ name, slug, color }) => (
                  <Link
                    key={slug}
                    to={`/operador/${slug}`}
                    onClick={closeMenu}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium
                               flex items-center gap-2 transition-colors hover:bg-gray-50"
                  >
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }} />
                    {name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={goToComparar}
            className={`px-3 py-3 rounded-xl text-base font-medium
                        min-h-[48px] flex items-center justify-between transition-colors
                        ${isActive('/comparar')
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'}`}
          >
            <span>⚖️ Comparar planes</span>
            {selectedPlans.length > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold
                               px-2 py-0.5 rounded-full">
                {selectedPlans.length}
              </span>
            )}
          </button>

          <Link to="/todos-los-planes" onClick={closeMenu}
                className={`px-3 py-3 rounded-xl text-base font-medium
                            min-h-[48px] flex items-center transition-colors
                            ${isActive('/todos-los-planes')
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'}`}>
            📋 Todos los planes
          </Link>

          <Link to="/nosotros" onClick={closeMenu}
                className={`px-3 py-3 rounded-xl text-base font-medium
                            min-h-[48px] flex items-center transition-colors
                            ${isActive('/nosotros')
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'}`}>
            ℹ️ Nosotros
          </Link>

          <Link to="/contacto" onClick={closeMenu}
                className={`px-3 py-3 rounded-xl text-base font-medium
                            min-h-[48px] flex items-center transition-colors
                            ${isActive('/contacto')
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'}`}>
            📋 Contacto
          </Link>

          {/* CTA mobile */}
          <button
            onClick={openChat}
            className="mt-2 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700
                       text-white font-bold text-base min-h-[52px]
                       transition-colors duration-150"
          >
            💬 Hablar con un asesor
          </button>
        </nav>
      </div>
    </>
  )
}
