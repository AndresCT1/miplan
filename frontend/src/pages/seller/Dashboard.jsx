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

function SkeletonBlock({ h = 'h-32' }) {
  return <div className={`bg-gray-100 rounded-xl ${h} animate-pulse`} />
}

export default function SellerDashboard() {
  const navigate = useNavigate()
  const [data,       setData]       = useState(null)
  const [convStats,  setConvStats]  = useState(null)
  const [projection, setProjection] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const [dash, conv, proj] = await Promise.all([
        sellerService.getDashboard(),
        sellerService.getConversionStats().catch(() => null),
        sellerService.getProjection().catch(() => null),
      ])
      setData(dash)
      setConvStats(conv)
      setProjection(proj)
    } catch (err) {
      setError(err.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const today = new Date().toISOString().split('T')[0]

  if (loading) return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
      <SkeletonBlock h="h-28" />
      <SkeletonBlock h="h-40" />
      <SkeletonBlock h="h-32" />
      <SkeletonBlock h="h-40" />
    </div>
  )

  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={fetchAll}
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
        <StatCard icon="👥" label="Clientes activos" color="blue"
          value={stats.total_clients}
          onClick={() => navigate('/equipo/clientes')} />
        <StatCard icon="⏳" label="Comisión pendiente" color="orange"
          value={`S/ ${parseFloat(stats.pending_commission).toFixed(2)}`} />
        <StatCard icon="✅" label="Cobrado este mes" color="green"
          value={`S/ ${parseFloat(stats.paid_this_month).toFixed(2)}`} />
        <StatCard icon="🎯" label="Prospectos activos" color="purple"
          value={stats.active_prospects}
          onClick={() => navigate('/equipo/prospectos')} />
      </div>

      {/* C — Banner seguimientos de hoy (también en dashboard) */}
      {todayFollowUps.length > 0 && (
        <div className="bg-green-50 border border-green-300 rounded-xl px-4 py-3
                        flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-green-800">
            📅 Tienes {todayFollowUps.length} seguimiento{todayFollowUps.length !== 1 ? 's' : ''} para hoy
          </p>
          <button
            onClick={() => navigate('/equipo/prospectos')}
            className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5
                       rounded-lg hover:bg-green-200 transition-colors whitespace-nowrap"
          >
            Ver ahora →
          </button>
        </div>
      )}

      {/* D — Rendimiento del mes (Conversion stats) */}
      {convStats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">📊 Tu rendimiento este mes</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-xl py-3 px-2">
              <p className="text-2xl font-extrabold text-gray-900">{convStats.prospectos_mes}</p>
              <p className="text-xs text-gray-500 mt-0.5">Prospectos</p>
            </div>
            <div className="bg-green-50 rounded-xl py-3 px-2">
              <p className="text-2xl font-extrabold text-green-700">{convStats.convertidos_mes}</p>
              <p className="text-xs text-gray-500 mt-0.5">Convertidos</p>
            </div>
            <div className="bg-blue-50 rounded-xl py-3 px-2">
              <p className="text-2xl font-extrabold text-blue-700">
                {convStats.tasa.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Conversión</p>
            </div>
          </div>
          {/* Barra de progreso */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Tasa de conversión</span>
              <span className="font-semibold text-green-700">{convStats.tasa.toFixed(1)}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(convStats.tasa, 100)}%` }}
              />
            </div>
          </div>
          {convStats.dias_promedio > 0 && (
            <p className="text-xs text-gray-400 text-center">
              Promedio de cierre: <strong className="text-gray-700">{convStats.dias_promedio.toFixed(0)} días</strong> por prospecto
            </p>
          )}
        </div>
      )}

      {/* Seguimientos de hoy (lista detallada) */}
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
          <p className="px-4 py-8 text-center text-sm text-gray-400">Sin seguimientos para hoy 🎉</p>
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
                  {p.operator_name && <p className="text-xs text-gray-400 mt-0.5">{p.operator_name}</p>}
                </div>
                <button onClick={() => navigate('/equipo/prospectos')}
                        className="text-xs text-green-600 font-medium hover:underline shrink-0">
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
          <button onClick={() => navigate('/equipo/clientes')}
                  className="text-xs text-green-600 font-medium hover:underline">
            Ver todos →
          </button>
        </div>
        {recentClients.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">Aún no registraste clientes</p>
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
                      ${c.commission_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {c.commission_status === 'paid' ? '✅ Pagada' : '⏳ Pendiente'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* F — Proyección del mes */}
      {projection && projection.total_proyectado > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h2 className="font-semibold text-green-900">Si cierras tus prospectos interesados...</h2>
          </div>
          <div className="bg-white rounded-xl px-4 py-3 text-center border border-green-200">
            <p className="text-xs text-green-700 font-medium">Podrías ganar adicionalmente</p>
            <p className="text-3xl font-extrabold text-green-700 mt-1">
              S/ {parseFloat(projection.total_proyectado).toFixed(2)}
            </p>
          </div>
          <div className="space-y-2">
            {projection.prospectos.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <span className="text-gray-800 font-medium truncate block">{p.prospect_name}</span>
                  {p.operator_name && (
                    <span className="text-xs text-gray-500">{p.operator_name}</span>
                  )}
                </div>
                <span className="font-semibold text-green-700 shrink-0 ml-2">
                  S/ {parseFloat(p.estimated_commission).toFixed(2)}
                </span>
              </div>
            ))}
            {projection.prospectos.length > 4 && (
              <p className="text-xs text-green-600 text-center">
                +{projection.prospectos.length - 4} prospectos más
              </p>
            )}
          </div>
          <button
            onClick={() => navigate('/equipo/prospectos')}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm
                       font-semibold rounded-xl transition-colors"
          >
            Ver prospectos →
          </button>
        </div>
      )}
    </div>
  )
}
