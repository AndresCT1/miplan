import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { sellerService } from '../../services/api'

function extractRegularPrice(features = []) {
  const feat = features.find(f => f.toLowerCase().startsWith('precio regular:'))
  if (!feat) return null
  const m = feat.match(/S\/([\d.]+)/)
  return m ? parseFloat(m[1]) : null
}

function PlanCard({ plan, operator, onVender }) {
  const commissionPct  = parseFloat(operator.commission_pct ?? 0)
  const regularPrice   = extractRegularPrice(plan.features ?? [])
  const basePrice      = regularPrice ?? parseFloat(plan.price)
  const commissionAmt  = commissionPct > 0
    ? (basePrice * commissionPct / 100).toFixed(2)
    : null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
      {/* Operador */}
      <div className="flex items-center gap-2">
        {operator.logo_url && (
          <img src={operator.logo_url} alt={operator.name}
               className="h-5 object-contain" />
        )}
        <span className="text-xs text-gray-400 font-medium">{operator.name}</span>
      </div>

      {/* Nombre del plan */}
      <p className="font-semibold text-gray-900 text-sm leading-snug">{plan.name}</p>

      {/* Precio promo grande */}
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-gray-400">S/</span>
          <span className="text-2xl font-extrabold text-gray-900">
            {parseFloat(plan.price).toFixed(2)}
          </span>
          <span className="text-xs text-gray-400">/mes promo</span>
        </div>
        {regularPrice && (
          <p className="text-xs text-gray-400 mt-0.5">
            Precio regular: <span className="line-through">S/{regularPrice.toFixed(2)}</span>
          </p>
        )}
      </div>

      {/* Velocidad */}
      <p className="text-xs text-gray-500">
        ⚡ {plan.speed_mbps} Mbps
      </p>

      {/* Comisión estimada */}
      {commissionAmt ? (
        <div className="bg-green-50 rounded-lg px-3 py-2">
          <p className="text-xs font-semibold text-green-700">
            💰 Ganas S/ {commissionAmt} ({commissionPct}%)
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 rounded-lg px-3 py-2">
          <p className="text-xs text-amber-600">Comisión pendiente</p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onVender}
        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white
                   text-sm font-semibold rounded-lg transition-colors"
      >
        Registrar venta
      </button>
    </div>
  )
}

export default function SellerCatalog() {
  const navigate = useNavigate()
  const [operators,   setOperators]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [selectedOp,  setSelectedOp]  = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
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
          <div key={i} className="bg-gray-100 rounded-xl h-52 animate-pulse" />
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

  // Aplanar todos los planes con su operador
  const allPlans = operators.flatMap(op =>
    (op.plans ?? []).map(plan => ({ plan, operator: op }))
  )
  const filteredPlans = selectedOp
    ? allPlans.filter(({ operator }) => operator.id === selectedOp)
    : allPlans

  const activeOpName = operators.find(o => o.id === selectedOp)?.name

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Catálogo</h1>
        <div className="flex items-center gap-2">
          {/* Botón filtrar — mobile */}
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border
                       border-gray-200 text-sm text-gray-600 shadow-sm md:hidden"
          >
            <span>🔽</span>
            <span>{activeOpName ?? 'Filtrar'}</span>
          </button>
          <button
            onClick={() => navigate('/equipo/nueva-venta')}
            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium
                       hover:bg-green-700 transition-colors"
          >
            ➕ Nueva venta
          </button>
        </div>
      </div>

      {/* Chips de filtro — siempre visible en desktop, colapsable en mobile */}
      <div className={`flex flex-wrap gap-2 ${filtersOpen ? 'flex' : 'hidden md:flex'}`}>
        <button
          onClick={() => { setSelectedOp(null); setFiltersOpen(false) }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
            ${!selectedOp ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Todos ({allPlans.length})
        </button>
        {operators.map(op => (
          <button
            key={op.id}
            onClick={() => { setSelectedOp(selectedOp === op.id ? null : op.id); setFiltersOpen(false) }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${selectedOp === op.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {op.name} ({(op.plans ?? []).length})
          </button>
        ))}
      </div>

      {/* Contador */}
      <p className="text-xs text-gray-400">
        {filteredPlans.length} plan{filteredPlans.length !== 1 ? 'es' : ''}
        {activeOpName ? ` de ${activeOpName}` : ''}
      </p>

      {/* Grid de plan cards */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>Sin planes disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map(({ plan, operator }) => (
            <PlanCard
              key={`${operator.id}-${plan.id}`}
              plan={plan}
              operator={operator}
              onVender={() => navigate(`/equipo/nueva-venta?planId=${plan.id}&operatorId=${operator.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
