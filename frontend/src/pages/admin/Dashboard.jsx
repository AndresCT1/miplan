import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/api'

function StatCard({ label, value, accent }) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${accent}`}>
      <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-4xl font-extrabold text-gray-900">{value ?? '—'}</p>
    </div>
  )
}

function BarChart({ data }) {
  if (!data?.length) return <p className="text-gray-400 text-sm">Sin datos</p>
  const max = Math.max(...data.map((d) => Number(d.count)), 1)

  return (
    <div className="flex items-end gap-4 h-36 pt-2">
      {data.map((d) => {
        const pct = Math.round((Number(d.count) / max) * 100)
        return (
          <div key={d.name} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className="text-xs text-gray-500 font-medium">{d.count}</span>
            <div
              className="w-full rounded-t-md bg-blue-500 transition-all duration-500"
              style={{ height: `${Math.max(pct * 1.12, 4)}px` }}
            />
            <span className="text-xs text-gray-600 text-center leading-tight truncate w-full">
              {d.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    adminService.getStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error}</div>
  )

  const estado    = stats?.por_estado ?? {}
  const operador  = stats?.por_operador ?? []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/admin/leads"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
          Ver todos los leads →
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total leads"   value={stats?.total_leads} accent="border-blue-500" />
        <StatCard label="Leads hoy"     value={stats?.leads_hoy}   accent="border-green-500" />
        <StatCard label="Pendientes"    value={estado.pending}     accent="border-yellow-500" />
        <StatCard label="Cerrados"      value={estado.closed}      accent="border-emerald-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Leads por operador</h2>
          <BarChart data={operador} />
        </div>

        {/* Estado breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Estado del pipeline</h2>
          <div className="space-y-3">
            {[
              { key: 'pending',    label: 'Pendiente',  color: 'bg-yellow-400' },
              { key: 'contacted',  label: 'Contactado', color: 'bg-blue-400' },
              { key: 'interested', label: 'Interesado', color: 'bg-teal-400' },
              { key: 'closed',     label: 'Cerrado',    color: 'bg-green-500' },
              { key: 'lost',       label: 'Perdido',    color: 'bg-red-400' },
            ].map(({ key, label, color }) => {
              const total = Number(stats?.total_leads) || 1
              const count = Number(estado[key]) || 0
              const pct   = Math.round((count / total) * 100)
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${color} transition-all duration-500`}
                         style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-700 w-6 text-right">{count}</span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Esta semana: <strong>{stats?.leads_semana ?? 0}</strong> leads
          </p>
        </div>
      </div>
    </div>
  )
}
