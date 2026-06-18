import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services/api'

const STATUS_CONFIG = {
  pending:    { label: 'Pendiente',  bg: 'bg-yellow-100', text: 'text-yellow-800' },
  contacted:  { label: 'Contactado', bg: 'bg-blue-100',   text: 'text-blue-800'   },
  interested: { label: 'Interesado', bg: 'bg-teal-100',   text: 'text-teal-800'   },
  closed:     { label: 'Cerrado',    bg: 'bg-green-100',  text: 'text-green-800'  },
  lost:       { label: 'Perdido',    bg: 'bg-red-100',    text: 'text-red-800'    },
}

const STATUSES   = Object.keys(STATUS_CONFIG)
const PAGE_SIZE  = 20

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: 'bg-gray-100', text: 'text-gray-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Leads() {
  const [leads,   setLeads]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [filters, setFilters] = useState({ status: '', operatorId: '' })
  const [updating, setUpdating] = useState({}) // { leadId: true }

  const fetchLeads = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = { page, limit: PAGE_SIZE }
      if (filters.status)     params.status     = filters.status
      if (filters.operatorId) params.operatorId = filters.operatorId
      const data = await adminService.getLeads(params)
      setLeads(data.leads)
      setTotal(data.total)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const handleFilterChange = (key, val) => {
    setPage(1)
    setFilters((prev) => ({ ...prev, [key]: val }))
  }

  const handleStatusChange = async (leadId, newStatus) => {
    setUpdating((p) => ({ ...p, [leadId]: true }))
    try {
      await adminService.updateStatus(leadId, newStatus)
      setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: newStatus } : l))
    } catch (e) {
      alert(`Error: ${e.message}`)
    } finally {
      setUpdating((p) => ({ ...p, [leadId]: false }))
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <span className="text-sm text-gray-500">{total} registros</span>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>

        <button
          onClick={() => { setFilters({ status: '', operatorId: '' }); setPage(1) }}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700
                     border border-gray-200 rounded-lg transition-colors"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-red-600 text-sm">{error}</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No hay leads con estos filtros</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Fecha', 'Nombre', 'DNI', 'Celular', 'Operador', 'Plan', 'Estado', 'Acción'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead, i) => (
                  <tr key={lead.id}
                      className={`hover:bg-blue-50 transition-colors duration-100 ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {lead.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{lead.dni}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.phone}</td>
                    <td className="px-4 py-3 text-gray-700">{lead.operator_name}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {lead.plan_name}
                      {lead.price && (
                        <span className="text-gray-400 text-xs ml-1">S/{Number(lead.price).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        disabled={updating[lead.id]}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5
                                   focus:outline-none focus:ring-2 focus:ring-blue-500
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600
                         hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors"
            >
              ← Anterior
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600
                         hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
