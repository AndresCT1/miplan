import { useState, useEffect, useCallback } from 'react'
import { sellerService } from '../../services/api'

function StatCard({ icon, label, value, sub, color = 'blue' }) {
  const ring = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  }[color]

  return (
    <div className="bg-white rounded-xl p-3 md:p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">
            {label}
          </p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 leading-none">
            {value}
          </p>
          {sub && (
            <p className="text-xs text-gray-400 mt-1 leading-tight">{sub}</p>
          )}
        </div>
        <span className={`text-lg md:text-2xl p-1.5 md:p-2 rounded-lg shrink-0 ${ring}`}>
          {icon}
        </span>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return <div className="bg-gray-100 rounded-xl h-24 md:h-28 animate-pulse" />
}

export default function SellerDashboard() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [marking, setMarking] = useState(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await sellerService.getDashboard()
      setData(res)
    } catch (err) {
      setError(err.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  const handleMarkContacted = async (saleId) => {
    setMarking(saleId)
    try {
      await sellerService.markContacted(saleId)
      await fetchDashboard()
    } catch (err) {
      alert(err.message || 'Error al actualizar')
    } finally {
      setMarking(null)
    }
  }

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
      <div className="bg-gray-100 rounded-xl h-64 animate-pulse" />
    </div>
  )

  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={fetchDashboard}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
        Reintentar
      </button>
    </div>
  )

  const { stats, urgentFollowups } = data

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Mi Dashboard</h1>

      {/* Métricas — 2 cols mobile, 3 cols sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
        <StatCard
          icon="💼"
          label="Ventas este mes"
          value={stats.sales_this_month}
          color="blue"
        />
        <StatCard
          icon="💰"
          label="Comisión mes"
          value={`S/ ${parseFloat(stats.commission_this_month).toFixed(2)}`}
          color="green"
        />
        <StatCard
          icon="⏰"
          label="Urgentes"
          value={stats.urgent_followups}
          sub="Para hoy o vencidos"
          color="orange"
        />
      </div>

      {/* Seguimientos urgentes — cards verticales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 md:px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Seguimientos urgentes</h2>
          <p className="text-xs text-gray-400 mt-0.5">Vencidos o programados para hoy</p>
        </div>

        {urgentFollowups.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">
            Sin seguimientos urgentes 🎉
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {urgentFollowups.map((sale) => (
              <div key={sale.id} className="px-4 md:px-5 py-4 space-y-2">
                {/* Fila 1: nombre + acción */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {sale.client_name}
                    </p>
                    <a
                      href={`tel:${sale.client_phone}`}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      📞 {sale.client_phone}
                    </a>
                  </div>
                  {sale.status === 'pending' ? (
                    <button
                      onClick={() => handleMarkContacted(sale.id)}
                      disabled={marking === sale.id}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white
                                 text-xs font-semibold rounded-lg transition-colors
                                 disabled:opacity-50 shrink-0"
                    >
                      {marking === sale.id ? '...' : '✓ Contactado'}
                    </button>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs
                                     rounded-lg capitalize shrink-0">
                      {sale.status}
                    </span>
                  )}
                </div>
                {/* Fila 2: operador + plan */}
                <p className="text-xs text-gray-500">
                  {sale.operator_name} · {sale.plan_name}
                </p>
                {/* Fila 3: fecha */}
                {sale.follow_up_date && (
                  <p className="text-xs text-orange-500 font-medium">
                    Seguimiento:{' '}
                    {new Date(sale.follow_up_date + 'T00:00:00').toLocaleDateString('es-PE')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
