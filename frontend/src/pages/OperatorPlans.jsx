import { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { useOperators } from '../hooks/useOperators'
import { usePlans }     from '../hooks/usePlans'
import PlanCard         from '../components/operators/PlanCard'
import PriceFilter      from '../components/operators/PriceFilter'

// ── Categorización ────────────────────────────────────────────────────────────
function categorizePlan(planName) {
  const lower = planName.toLowerCase()
  if (lower.includes('tv') || lower.includes('tvgo')) return 'internet_tv'
  return 'internet'
}

const TABS = [
  { key: 'internet',    label: 'Solo Internet' },
  { key: 'internet_tv', label: 'Internet + TV'  },
]

function applyPriceFilter(plans, filter) {
  if (filter === 'all')  return plans
  if (filter === 'low')  return plans.filter(p => Number(p.price) <= 60)
  if (filter === 'mid')  return plans.filter(p => Number(p.price) > 60 && Number(p.price) <= 90)
  if (filter === 'high') return plans.filter(p => Number(p.price) > 90)
  return plans
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function PlansSkeleton({ color }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl animate-pulse h-96"
             style={{ backgroundColor: `${color}18` }} />
      ))}
    </div>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
function CategoryTabs({ tabs, activeTab, onChange, brandColor }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2" role="tablist">
      {tabs.map(({ key, label, count }) => {
        const isActive = activeTab === key
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-base font-medium
                       min-h-[48px] transition-all duration-150 border-2"
            style={isActive
              ? { backgroundColor: brandColor, borderColor: brandColor, color: '#fff', fontWeight: 700 }
              : { backgroundColor: '#fff', borderColor: '#D1D5DB', color: '#6B7280' }
            }
          >
            {label}{' '}
            <span style={isActive ? { opacity: 0.75 } : { opacity: 0.6 }}>({count})</span>
          </button>
        )
      })}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function OperatorPlans() {
  const { slug }  = useParams()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [activeTab,    setActiveTab]    = useState('internet')
  const [priceFilter,  setPriceFilter]  = useState('all')
  const [headerLogoFailed, setHeaderLogoFailed] = useState(false)

  const { operators } = useOperators()
  const operator = location.state?.operator ?? operators.find((o) => o.slug === slug)

  const { plans, loading, error, refetch } = usePlans(operator?.id)

  const color  = operator?.brand_color || '#2563EB'
  const bgPage = `${color}0F`

  useEffect(() => {
    if (operator?.name) {
      document.title = `Planes ${operator.name} en Arequipa | MiPlan.pe`
    }
  }, [operator?.name])

  // Resetear filtro de precio al cambiar de categoría
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    setPriceFilter('all')
  }, [])

  // Categorizar planes
  const categorized = useMemo(() => {
    const groups = { internet: [], internet_tv: [] }
    plans.forEach(p => groups[categorizePlan(p.name)].push(p))
    return groups
  }, [plans])

  // Tabs visibles (con conteo total, sin filtro de precio)
  const visibleTabs = TABS
    .map(t => ({ ...t, count: categorized[t.key]?.length ?? 0 }))
    .filter(t => t.count > 0)

  const currentTab = visibleTabs.find(t => t.key === activeTab)
    ? activeTab
    : visibleTabs[0]?.key ?? 'internet'

  // Planes de la categoría activa, ordenados
  const sortedPlans = useMemo(() => {
    return [...(categorized[currentTab] ?? [])].sort((a, b) => {
      if (b.is_featured !== a.is_featured) return b.is_featured ? 1 : -1
      return Number(a.price) - Number(b.price)
    })
  }, [categorized, currentTab])

  // Filtro de precio aplicado sobre los planes ya ordenados
  const filteredPlans = useMemo(
    () => applyPriceFilter(sortedPlans, priceFilter),
    [sortedPlans, priceFilter],
  )

  const showFilters  = !loading && !error && plans.length > 0
  const noResults    = showFilters && filteredPlans.length === 0 && priceFilter !== 'all'

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgPage }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: color }}>
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/90 hover:text-white
                       text-sm font-medium border border-white/40 rounded-lg
                       px-3 py-2 transition-colors duration-150 min-h-[40px]"
          >
            ← Volver al inicio
          </button>

          {operator && (
            <div className="flex items-center gap-3 ml-1">
              <div className="w-16 h-16 bg-white rounded-xl p-1.5 shadow-sm
                              flex items-center justify-center shrink-0">
                {!headerLogoFailed ? (
                  <img
                    src={`/logos/${operator.slug}.png`}
                    alt={`Logo de ${operator.name}`}
                    className="w-full h-full object-contain"
                    onError={() => setHeaderLogoFailed(true)}
                  />
                ) : (
                  <span className="text-xl font-extrabold"
                        style={{ color: operator.brand_color }}>
                    {operator.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                {operator.name}
              </h1>
            </div>
          )}
        </div>

        {/* Breadcrumb */}
        <div className="max-w-5xl mx-auto px-4 pb-4">
          <nav aria-label="Ubicación"
               className="flex items-center gap-1.5 text-sm text-white/70">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <span aria-hidden="true">›</span>
            <span className="text-white/90 font-medium">{operator?.name ?? slug}</span>
            <span aria-hidden="true">›</span>
            <span className="text-white font-semibold">Planes</span>
          </nav>
        </div>
      </header>

      {/* ── CONTENIDO ───────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-10">

        {loading && <PlansSkeleton color={color} />}

        {error && (
          <div className="text-center py-16">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button onClick={refetch}
              className="px-6 py-3 border-2 rounded-xl text-gray-600 border-gray-300
                         hover:bg-white transition-colors min-h-[48px]">
              Reintentar
            </button>
          </div>
        )}

        {showFilters && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Planes de <span style={{ color }}>{operator?.name}</span>
            </h2>

            {/* Tabs de categoría */}
            {visibleTabs.length > 1 && (
              <div className="mb-3">
                <CategoryTabs
                  tabs={visibleTabs}
                  activeTab={currentTab}
                  onChange={handleTabChange}
                  brandColor={color}
                />
              </div>
            )}

            {/* Filtro de precio */}
            <div className="mb-5">
              <PriceFilter
                active={priceFilter}
                onChange={setPriceFilter}
                brandColor={color}
              />
            </div>

            {/* Contador dinámico */}
            <p className="text-sm text-gray-500 mb-4">
              Mostrando{' '}
              <span className="font-semibold text-gray-700">{filteredPlans.length}</span>
              {filteredPlans.length === 1 ? ' plan' : ' planes'}
              {priceFilter !== 'all' && (
                <button
                  onClick={() => setPriceFilter('all')}
                  className="ml-2 text-xs underline underline-offset-2 hover:text-gray-900
                             transition-colors"
                  style={{ color }}
                >
                  Limpiar filtro
                </button>
              )}
            </p>

            {/* Grid de planes */}
            {!noResults ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative transition-transform duration-150
                      ${plan.is_featured ? 'mt-6 sm:scale-105 z-10' : ''}`}
                  >
                    {plan.is_featured && (
                      <div
                        className="absolute -top-4 left-1/2 -translate-x-1/2
                                   z-20 whitespace-nowrap text-white text-sm
                                   font-bold px-4 py-1 rounded-full shadow-md"
                        style={{ backgroundColor: color }}
                      >
                        ⭐ El más pedido
                      </div>
                    )}
                    <PlanCard
                      plan={plan}
                      operatorName={operator?.name}
                      operatorId={operator?.id}
                      operatorSlug={slug}
                      brandColor={color}
                      highlighted={plan.is_featured}
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Sin resultados con filtro de precio activo */
              <div className="text-center py-16">
                <p className="text-4xl mb-4" aria-hidden="true">🔍</p>
                <p className="text-gray-700 text-lg font-semibold mb-2">
                  No hay planes en este rango de precio
                </p>
                <p className="text-gray-500 text-base mb-6">
                  Prueba con otro filtro o mira todos los planes disponibles
                </p>
                <button
                  onClick={() => setPriceFilter('all')}
                  className="px-6 py-3 rounded-xl text-white font-semibold
                             min-h-[48px] transition-opacity hover:opacity-90"
                  style={{ backgroundColor: color }}
                >
                  Ver todos los planes
                </button>
              </div>
            )}
          </>
        )}

        {!loading && !error && plans.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No hay planes disponibles en este momento.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
