import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { sellerService } from '../../services/api'

function StatCard({ icon, label, value, color = 'blue', onClick }) {
  const ring = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  }[color]

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100
                  ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">{label}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1 leading-none">{value}</p>
        </div>
        <span className={`text-lg p-1.5 rounded-lg shrink-0 ${ring}`}>{icon}</span>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return <div className="bg-gray-100 rounded-xl h-20 animate-pulse" />
}

export default function SellerDashboard() {
  const navigate = useNavigate()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      setData(await sellerService.getDashboard())
    } catch (err) {
      setError(err.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  if (loading) return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
      <div className="bg-gray-100 rounded-xl h-40 animate-pulse" />
      <div className="bg-gray-100 rounded-xl h-40 animate-pulse" />
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

  const { stats, todayFollowUps = [], recentClients = [] } = data

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Mi Panel</h1>

      {/* 4 métricas */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="👥" label="Clientes activos" color="blue"
          value={stats.total_clients}
          onClick={() => navigate('/equipo/clientes')}
        />
        <StatCard
          icon="⏳" label="Comisión pendiente" color="orange"
          value={`S/ ${parseFloat(stats.pending_commission).toFixed(2)}`}
        />
        <StatCard
          icon="✅" label="Cobrado este mes" color="green"
          value={`S/ ${parseFloat(stats.paid_this_month).toFixed(2)}`}
        />
        <StatCard
          icon="🎯" label="Prospectos activos" color="purple"
          value={stats.active_prospects}
          onClick={() => navigate('/equipo/prospectos')}
        />
      </div>

      {/* Seguimientos de hoy */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">Seguimientos de hoy</h2>
            <p className="text-xs text-gray-400 mt-0.5">Prospectos programados para hoy</p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                           ${todayFollowUps.length > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
            {todayFollowUps.length}
          </span>
        </div>
        {todayFollowUps.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">
            Sin seguimientos para hoy 🎉
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayFollowUps.map(p => (
              <div key={p.id} className="px-4 py-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{p.prospect_name}</p>
                  {p.prospect_phone && (
                    <a href={`tel:${p.prospect_phone}`} className="text-xs text-blue-600 hover:underline">
                      📞 {p.prospect_phone}
                    </a>
                  )}
                  {p.operator_name && (
                    <p className="text-xs text-gray-400 mt-0.5">{p.operator_name}</p>
                  )}
                </div>
                <button
                  onClick={() => navigate('/equipo/prospectos')}
                  className="text-xs text-green-600 font-medium hover:underline shrink-0"
                >
                  Ver →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Últimos clientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Últimos clientes</h2>
          <button
            onClick={() => navigate('/equipo/clientes')}
            className="text-xs text-green-600 font-medium hover:underline"
          >
            Ver todos →
          </button>
        </div>
        {recentClients.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">
            Aún no registraste clientes
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentClients.map(c => (
              <div key={c.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{c.client_name}</p>
                    <p className="text-xs text-gray-400">{c.operator_name} · {c.plan_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-green-700">
                      S/ {parseFloat(c.commission_amount).toFixed(2)}
                    </p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                      ${c.commission_status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'}`}>
                      {c.commission_status === 'paid' ? '✅ Pagada' : '⏳ Pendiente'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
