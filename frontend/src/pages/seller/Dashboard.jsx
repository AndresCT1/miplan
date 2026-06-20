import { useState, useEffect, useCallback } from 'react'
import { sellerService } from '../../services/api'

function StatCard({ icon, label, value, sub, color = 'blue' }) {
  const ring = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  }[color]

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className={`text-2xl p-2 rounded-lg ${ring}`}>{icon}</span>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return <div className="bg-gray-100 rounded-xl h-28 animate-pulse" />
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Mi Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon="💼"
          label="Ventas este mes"
          value={stats.sales_this_month}
          color="blue"
        />
        <StatCard
          icon="💰"
          label="Comisión este mes"
          value={`S/ ${parseFloat(stats.commission_this_month).toFixed(2)}`}
          color="green"
        />
        <StatCard
          icon="⏰"
          label="Seguimientos urgentes"
          value={stats.urgent_followups}
          sub="Vencidos o para hoy"
          color="orange"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Seguimientos urgentes</h2>
          <p className="text-xs text-gray-400 mt-0.5">Vencidos o programados para hoy</p>
        </div>

        {urgentFollowups.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">
            Sin seguimientos urgentes por ahora
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {urgentFollowups.map((sale) => (
              <div key={sale.id}
                   className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{sale.client_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {sale.operator_name} · {sale.plan_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Seguimiento: {sale.follow_up_date
                      ? new Date(sale.follow_up_date + 'T00:00:00').toLocaleDateString('es-PE')
                      : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <a href={`tel:${sale.client_phone}`}
                     className="text-xs text-blue-600 hover:underline">
                    {sale.client_phone}
                  </a>
                  {sale.status === 'pending' && (
                    <button
                      onClick={() => handleMarkContacted(sale.id)}
                      disabled={marking === sale.id}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white
                                 text-xs font-medium rounded-lg transition-colors
                                 disabled:opacity-50"
                    >
                      {marking === sale.id ? 'Guardando...' : 'Marcar contactado'}
                    </button>
                  )}
                  {sale.status !== 'pending' && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg capitalize">
                      {sale.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
