import { useState, useMemo } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { useOperators } from '../hooks/useOperators'
import { usePlans }     from '../hooks/usePlans'
import PlanCard         from '../components/operators/PlanCard'

// ── Categorización de planes ─────────────────────────────────────────────────
function categorizePlan(planName) {
  const lower = planName.toLowerCase()
  if (lower.includes('tv') || lower.includes('tvgo')) return 'internet_tv'
  return 'internet'
}

const TABS = [
  { key: 'internet',    label: 'Solo Internet' },
  { key: 'internet_tv', label: 'Internet + TV'  },
]

// ── Skeleton con color del operador ─────────────────────────────────────────
function PlansSkeleton({ color }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl animate-pulse h-96"
             style={{ backgroundColor: `${color}18` }} />
      ))}
    </div>
  )
}

// ── Tabs de categoría ────────────────────────────────────────────────────────
function CategoryTabs({ tabs, activeTab, onChange, brandColor }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-8" role="tablist">
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
            <span style={isActive ? { opacity: 0.75 } : { opacity: 0.6 }}>
              ({count})
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function OperatorPlans() {
  const { slug }   = useParams()
  const location   = useLocation()
  const navigate   = useNavigate()
  const [activeTab, setActiveTab] = useState('internet')

  const { operators } = useOperators()
  const operator = location.state?.operator ?? operators.find((o) => o.slug === slug)

  const { plans, loading, error, refetch } = usePlans(operator?.id)

  const color   = operator?.brand_color || '#2563EB'
  const bgPage  = `${color}0F`   // ~6% opacity — fondo de página
  const bgLight = `${color}08`   // ~3% — fondo de cards zona

  // Categorizar y filtrar planes
  const categorized = useMemo(() => {
    const groups = { internet: [], internet_tv: [] }
    plans.forEach(p => groups[categorizePlan(p.name)].push(p))
    return groups
  }, [plans])

  // Tabs visibles: solo los que tengan planes
  const visibleTabs = TABS
    .map(t => ({ ...t, count: categorized[t.key]?.length ?? 0 }))
    .filter(t => t.count > 0)

  // Si el tab activo quedó vacío tras cargar (ej: todos son internet_tv), ajustar
  const currentTab = visibleTabs.find(t => t.key === activeTab)
    ? activeTab
    : visibleTabs[0]?.key ?? 'internet'

  const visiblePlans = categorized[currentTab] ?? []

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgPage }}>

      {/* ── HEADER CON COLOR DEL OPERADOR ──────────────────────────────────── */}
      <header style={{ backgroundColor: color }}>
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center gap-4">

          {/* Botón volver */}
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
              {/* Círculo grande con inicial */}
              <div className="w-11 h-11 rounded-full bg-white/20 border-2 border-white/50
                              flex items-center justify-center
                              text-white text-xl font-extrabold shrink-0">
                {operator.name.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                {operator.name}
              </h1>
            </div>
          )}
        </div>

        {/* ── BREADCRUMB ─────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 pb-4">
          <nav aria-label="Ubicación" className="flex items-center gap-1.5 text-sm text-white/70">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <span aria-hidden="true">›</span>
            <span className="text-white/90 font-medium">
              {operator?.name ?? slug}
            </span>
            <span aria-hidden="true">›</span>
            <span className="text-white font-semibold">Planes</span>
          </nav>
        </div>
      </header>

      {/* ── CONTENIDO ──────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-10">

        {/* Cargando */}
        {loading && <PlansSkeleton color={color} />}

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-6 py-3 border-2 rounded-xl text-gray-600 border-gray-300
                         hover:bg-white transition-colors min-h-[48px]"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Planes cargados */}
        {!loading && !error && plans.length > 0 && (
          <>
            {/* Título de sección */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Planes de{' '}
              <span style={{ color }}>{operator?.name}</span>
            </h2>

            {/* Tabs de categoría */}
            {visibleTabs.length > 1 && (
              <CategoryTabs
                tabs={visibleTabs}
                activeTab={currentTab}
                onChange={setActiveTab}
                brandColor={color}
              />
            )}

            {/* Grid de planes */}
            {visiblePlans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visiblePlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    operatorName={operator?.name}
                    operatorId={operator?.id}
                    brandColor={color}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">
                  No hay planes disponibles en esta categoría.
                </p>
              </div>
            )}
          </>
        )}

        {/* Sin planes */}
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
