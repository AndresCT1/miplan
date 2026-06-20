import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { sellerService } from '../../services/api'

function CommissionBadge({ plan, commissionPct }) {
  if (parseFloat(commissionPct) === 0) {
    return (
      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
        Comisión pendiente de configurar
      </span>
    )
  }
  const amount = (parseFloat(plan.price) * (parseFloat(commissionPct) / 100)).toFixed(2)
  return (
    <span className="text-sm font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-md">
      Ganas S/ {amount} por esta venta
    </span>
  )
}

export default function SellerCatalog() {
  const navigate = useNavigate()
  const [operators, setOperators] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [search,    setSearch]    = useState('')
  const [selectedOp, setSelectedOp] = useState(null)

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
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
      ))}
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

  const filtered = operators.filter(op =>
    !selectedOp || op.id === selectedOp
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Catálogo de Planes</h1>
        <button
          onClick={() => navigate('/equipo/nueva-venta')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium
                     hover:bg-green-700 transition-colors"
        >
          ➕ Registrar venta
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedOp(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
            ${!selectedOp
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Todos
        </button>
        {operators.map(op => (
          <button
            key={op.id}
            onClick={() => setSelectedOp(selectedOp === op.id ? null : op.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${selectedOp === op.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {op.name}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.map(op => (
          <div key={op.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              {op.logo_url && (
                <img src={op.logo_url} alt={op.name} className="h-7 object-contain" />
              )}
              <div>
                <h2 className="font-semibold text-gray-900">{op.name}</h2>
                <p className="text-xs text-gray-400">
                  Comisión: {parseFloat(op.commission_pct) === 0
                    ? 'Pendiente de configurar'
                    : `${parseFloat(op.commission_pct).toFixed(2)}%`}
                </p>
              </div>
            </div>

            {(!op.plans || op.plans.length === 0) ? (
              <p className="px-5 py-6 text-sm text-gray-400">Sin planes disponibles</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {op.plans?.map(plan => (
                  <div key={plan.id} className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-medium text-gray-900">{plan.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {plan.speed_mbps} Mbps · S/ {parseFloat(plan.price).toFixed(2)}/mes
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <CommissionBadge plan={plan} commissionPct={op.commission_pct} />
                      <button
                        onClick={() => navigate(`/equipo/nueva-venta?planId=${plan.id}&operatorId=${op.id}`)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white
                                   text-xs font-medium rounded-lg transition-colors"
                      >
                        Vender
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
