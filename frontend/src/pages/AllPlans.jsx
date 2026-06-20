import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate }            from 'react-router-dom'
import { useAllPlans }                  from '../hooks/useAllPlans'
import PlanCard                         from '../components/operators/PlanCard'

// ── Helpers ───────────────────────────────────────────────────────────────────
const hasTV = (plan) =>
  plan.features?.some((f) => /tv|televi|cable/i.test(f))

const PRICE_RANGES = [
  { key: 'all',      label: 'Todos los precios' },
  { key: 'under60',  label: 'Hasta S/60' },
  { key: '60to100',  label: 'S/60 – S/100' },
  { key: 'over100',  label: 'Más de S/100' },
]

const SORTS = [
  { key: 'price_asc',  label: 'Menor precio primero' },
  { key: 'speed_desc', label: 'Mayor velocidad primero' },
  { key: 'price_desc', label: 'Mayor precio primero' },
]

// ── Skeleton ──────────────────────────────────────────────────────────────────
function PlansSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-80" />
      ))}
    </div>
  )
}

// ── Operator badge above each card ────────────────────────────────────────────
function PlanWithOperator({ plan }) {
  return (
    <div className="flex flex-col">
      <Link
        to={`/operador/${plan.operator_slug}`}
        className="flex items-center gap-2 mb-2 px-1 group"
      >
        {plan.logo_url && (
          <img
            src={plan.logo_url}
            alt={plan.operator_name}
            className="h-6 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
          />
        )}
        <span
          className="text-xs font-semibold transition-colors group-hover:underline"
          style={{ color: plan.brand_color || '#4B5563' }}
        >
          {plan.operator_name}
        </span>
        <span className="text-xs text-gray-400 ml-auto">Ver todos →</span>
      </Link>

      <PlanCard
        plan={plan}
        operatorName={plan.operator_name}
        operatorId={plan.operator_id}
        operatorSlug={plan.operator_slug}
        brandColor={plan.brand_color}
      />
    </div>
  )
}

// ── Chip / Tab components ─────────────────────────────────────────────────────
function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
        ${active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}
    >
      {children}
    </button>
  )
}

function CategoryTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors min-h-[40px]
        ${active
          ? 'bg-blue-600 text-white'
          : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}
    >
      {children}
    </button>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AllPlans() {
  const navigate                    = useNavigate()
  const { plans, loading, error, refetch } = useAllPlans()

  const [category,   setCategory]   = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [sort,       setSort]       = useState('price_asc')

  useEffect(() => {
    document.title = 'Todos los planes de internet | MiPlan.pe'
  }, [])

  const filtered = useMemo(() => {
    let result = [...plans]

    if (category === 'internet')    result = result.filter((p) => !hasTV(p))
    if (category === 'internet_tv') result = result.filter((p) => hasTV(p))

    if (priceRange === 'under60')  result = result.filter((p) => parseFloat(p.price) <= 60)
    if (priceRange === '60to100')  result = result.filter((p) => parseFloat(p.price) > 60 && parseFloat(p.price) <= 100)
    if (priceRange === 'over100')  result = result.filter((p) => parseFloat(p.price) > 100)

    if (sort === 'price_asc')   result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
    if (sort === 'price_desc')  result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
    if (sort === 'speed_desc')  result.sort((a, b) => b.speed_mbps - a.speed_mbps)

    return result
  }, [plans, category, priceRange, sort])

  const total = plans.length

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900
                       text-sm font-medium transition-colors min-h-[44px]"
          >
            ← Volver
          </button>
          <Link to="/" className="text-blue-600 font-extrabold text-lg hidden sm:block">
            MiPlan<span className="text-gray-900">.pe</span>
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Hero título ────────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700
                          text-sm font-semibold px-4 py-2 rounded-full mb-4">
            📡 Catálogo completo
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            Todos los planes disponibles
          </h1>
          <p className="text-gray-500 text-base">
            {total > 0 ? `${total} planes` : 'Planes'} de 5 operadores en un solo lugar
          </p>
        </div>

        {/* ── Controles ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 space-y-4">

          {/* Tabs de categoría */}
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
              Tipo de plan
            </p>
            <div className="flex flex-wrap gap-2">
              <CategoryTab active={category === 'all'}         onClick={() => setCategory('all')}>
                Todos
              </CategoryTab>
              <CategoryTab active={category === 'internet'}    onClick={() => setCategory('internet')}>
                Solo Internet
              </CategoryTab>
              <CategoryTab active={category === 'internet_tv'} onClick={() => setCategory('internet_tv')}>
                Internet + TV
              </CategoryTab>
            </div>
          </div>

          {/* Precio + Ordenar */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                Rango de precio
              </p>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map(({ key, label }) => (
                  <Chip key={key} active={priceRange === key} onClick={() => setPriceRange(key)}>
                    {label}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="sm:w-56">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                Ordenar por
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white
                           text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORTS.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Contador ───────────────────────────────────────────────────── */}
        {!loading && !error && (
          <p className="text-sm text-gray-500 mb-4">
            Mostrando{' '}
            <span className="font-semibold text-gray-900">{filtered.length}</span>
            {' '}de{' '}
            <span className="font-semibold text-gray-900">{total}</span>
            {' '}planes
          </p>
        )}

        {/* ── Contenido ──────────────────────────────────────────────────── */}
        {loading && <PlansSkeleton />}

        {error && (
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium
                         hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-2">
              No hay planes con estos filtros
            </p>
            <button
              onClick={() => { setCategory('all'); setPriceRange('all') }}
              className="text-blue-600 text-sm hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((plan) => (
              <PlanWithOperator key={plan.id} plan={plan} />
            ))}
          </div>
        )}

        {/* ── CTA comparador ─────────────────────────────────────────────── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm mb-4">
              ¿Dudas entre varios planes? Compáralos lado a lado
            </p>
            <Link
              to="/comparar"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600
                         hover:bg-blue-700 text-white font-semibold rounded-xl
                         transition-colors min-h-[48px]"
            >
              ⚖️ Ir al comparador de planes
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
