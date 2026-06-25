import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { sellerService } from '../../services/api'

function extractRegularPrice(features = []) {
  const feat = features.find(f => f.toLowerCase().startsWith('precio regular:'))
  if (!feat) return null
  const m = feat.match(/S\/([\d.]+)/)
  return m ? parseFloat(m[1]) : null
}

// Convierte #RRGGBB a rgba con opacidad
function hexToRgba(hex, alpha = 0.15) {
  if (!hex) return `rgba(0,0,0,${alpha})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ── Plan Card con color de operador ──────────────────────────────────────────
function PlanCard({ plan, operator, onVender }) {
  const color         = operator.brand_color || '#6B7280'
  const commissionPct = parseFloat(operator.commission_pct ?? 0)
  const regularPrice  = extractRegularPrice(plan.features ?? [])
  const basePrice     = regularPrice ?? parseFloat(plan.price)
  const commissionAmt = commissionPct > 0
    ? (basePrice * commissionPct / 100).toFixed(2)
    : null

  const [logoError, setLogoError] = useState(false)

  return (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col"
      style={{ border: '1px solid #e5e7eb', borderTop: `4px solid ${color}` }}
    >
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Badge operador con color de marca */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full"
            style={{ backgroundColor: hexToRgba(color, 0.12) }}
          >
            {!logoError ? (
              <img
                src={`/logos/${operator.slug}.png`}
                alt={operator.name}
                className="h-4 w-auto object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-xs font-extrabold" style={{ color }}>
                {operator.name.charAt(0)}
              </span>
            )}
            <span className="text-xs font-semibold" style={{ color }}>
              {operator.name}
            </span>
          </div>
          {commissionPct > 0 && (
            <span className="text-xs text-gray-400 ml-auto">{commissionPct}% comisión</span>
          )}
        </div>

        {/* Nombre del plan */}
        <p className="font-semibold text-gray-900 text-sm leading-snug">{plan.name}</p>

        {/* Precio */}
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-gray-400">S/</span>
            <span className="text-2xl font-extrabold" style={{ color }}>
              {parseFloat(plan.price).toFixed(2)}
            </span>
            <span className="text-xs text-gray-400">/mes promo</span>
          </div>
          {regularPrice && (
            <p className="text-xs text-gray-400 mt-0.5">
              Regular: <span className="line-through">S/{regularPrice.toFixed(2)}</span>
            </p>
          )}
        </div>

        {/* Velocidad */}
        <p className="text-xs text-gray-500">⚡ {plan.speed_mbps} Mbps</p>

        {/* Comisión */}
        {commissionAmt ? (
          <div className="rounded-lg px-3 py-2" style={{ backgroundColor: hexToRgba(color, 0.08) }}>
            <p className="text-xs font-semibold" style={{ color }}>
              💰 Ganas S/ {commissionAmt}
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 rounded-lg px-3 py-2">
            <p className="text-xs text-amber-600">Comisión pendiente</p>
          </div>
        )}
      </div>

      {/* CTA con color del operador */}
      <div className="px-4 pb-4">
        <button
          onClick={onVender}
          className="w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: color }}
        >
          Registrar venta
        </button>
      </div>
    </div>
  )
}

// ── Encabezado de sección por operador ───────────────────────────────────────
function OperatorHeader({ operator }) {
  const color      = operator.brand_color || '#6B7280'
  const [logoErr, setLogoErr] = useState(false)

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl mb-3"
      style={{ backgroundColor: hexToRgba(color, 0.08), borderLeft: `4px solid ${color}` }}
    >
      {!logoErr ? (
        <img
          src={`/logos/${operator.slug}.png`}
          alt={operator.name}
          className="h-7 object-contain"
          onError={() => setLogoErr(true)}
        />
      ) : (
        <span className="text-lg font-extrabold w-7 text-center" style={{ color }}>
          {operator.name.charAt(0)}
        </span>
      )}
      <div>
        <p className="font-bold text-sm" style={{ color }}>{operator.name}</p>
        <p className="text-xs text-gray-400">
          {(operator.plans ?? []).length} plan{(operator.plans ?? []).length !== 1 ? 'es' : ''}
          {parseFloat(operator.commission_pct) > 0
            ? ` · ${parseFloat(operator.commission_pct).toFixed(0)}% comisión`
            : ' · Comisión pendiente'}
        </p>
      </div>
    </div>
  )
}

// ── Chip de filtro con color de operador ──────────────────────────────────────
function FilterChip({ operator, isActive, onToggle }) {
  const color = operator.brand_color || '#6B7280'

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                 transition-all duration-150 flex-shrink-0 border"
      style={isActive
        ? { backgroundColor: color, borderColor: color, color: '#fff' }
        : { backgroundColor: hexToRgba(color, 0.08), borderColor: hexToRgba(color, 0.3), color }
      }
    >
      <span className="font-bold">{operator.name.charAt(0)}</span>
      <span>{operator.name}</span>
      <span className="opacity-70">({(operator.plans ?? []).length})</span>
    </button>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function SellerCatalog() {
  const navigate = useNavigate()
  const [operators,   setOperators]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [selectedOp,  setSelectedOp]  = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const data = await sellerService.getCatalog()
      setOperators(data)
    } catch (err) {
      setError(err.message || 'Error al cargar el catálogo')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCatalog() }, [fetchCatalog])

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-56 animate-pulse" />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={fetchCatalog}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
        Reintentar
      </button>
    </div>
  )

  const allPlans = operators.flatMap(op =>
    (op.plans ?? []).map(plan => ({ plan, operator: op }))
  )
  const activeOp      = operators.find(o => o.id === selectedOp)
  const filteredOps   = selectedOp ? operators.filter(o => o.id === selectedOp) : operators
  const filteredPlans = allPlans.filter(({ operator }) =>
    !selectedOp || operator.id === selectedOp
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Catálogo</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Toca "Registrar venta" en el plan que vendiste para registrarlo en Clientes
          </p>
        </div>
        <button
          onClick={() => setFiltersOpen(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border
                     border-gray-200 text-sm shadow-sm md:hidden shrink-0"
          style={activeOp ? { borderColor: activeOp.brand_color, color: activeOp.brand_color } : { color: '#6B7280' }}
        >
          <span>🔽</span>
          <span>{activeOp?.name ?? 'Filtrar'}</span>
        </button>
      </div>

      {/* Chips de filtro — scroll horizontal en mobile */}
      <div className={`${filtersOpen ? 'block' : 'hidden md:block'}`}>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {/* Chip "Todos" */}
          <button
            onClick={() => { setSelectedOp(null); setFiltersOpen(false) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                       transition-all duration-150 flex-shrink-0 border"
            style={!selectedOp
              ? { backgroundColor: '#111827', borderColor: '#111827', color: '#fff' }
              : { backgroundColor: '#f3f4f6', borderColor: '#d1d5db', color: '#6b7280' }
            }
          >
            Todos ({allPlans.length})
          </button>
          {operators.map(op => (
            <FilterChip
              key={op.id}
              operator={op}
              isActive={selectedOp === op.id}
              onToggle={() => {
                setSelectedOp(selectedOp === op.id ? null : op.id)
                setFiltersOpen(false)
              }}
            />
          ))}
        </div>
      </div>

      {/* Contador */}
      <p className="text-xs text-gray-400">
        {filteredPlans.length} plan{filteredPlans.length !== 1 ? 'es' : ''}
        {activeOp ? ` de ${activeOp.name}` : ''}
      </p>

      {/* Vista por operador con separadores */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>Sin planes disponibles</p>
        </div>
      ) : selectedOp ? (
        /* Filtrado por un operador: grid sin separadores */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map(({ plan, operator }) => (
            <PlanCard
              key={`${operator.id}-${plan.id}`}
              plan={plan}
              operator={operator}
              onVender={() => navigate('/equipo/clientes', {
                state: {
                  newClient:    true,
                  operatorId:   operator.id,
                  planId:       plan.id,
                  regularPrice: extractRegularPrice(plan.features ?? []) ?? parseFloat(plan.price),
                  commissionPct: parseFloat(operator.commission_pct ?? 0),
                },
              })}
            />
          ))}
        </div>
      ) : (
        /* Todos los operadores: agrupados por operador */
        <div className="space-y-8">
          {filteredOps.map(op => {
            const opPlans = allPlans.filter(({ operator }) => operator.id === op.id)
            if (opPlans.length === 0) return null
            return (
              <div key={op.id}>
                <OperatorHeader operator={op} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {opPlans.map(({ plan, operator }) => (
                    <PlanCard
                      key={`${operator.id}-${plan.id}`}
                      plan={plan}
                      operator={operator}
                      onVender={() => navigate('/equipo/clientes', {
                state: {
                  newClient:    true,
                  operatorId:   operator.id,
                  planId:       plan.id,
                  regularPrice: extractRegularPrice(plan.features ?? []) ?? parseFloat(plan.price),
                  commissionPct: parseFloat(operator.commission_pct ?? 0),
                },
              })}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
