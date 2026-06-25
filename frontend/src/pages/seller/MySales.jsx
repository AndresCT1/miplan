import { useState, useEffect, useCallback } from 'react'
import { sellerService } from '../../services/api'

function formatDate(val) {
  if (!val) return '—'
  const d = val instanceof Date ? val : new Date(val)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const STATUS_LABELS = {
  pending:   { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
  contacted: { label: 'Contactado', color: 'bg-blue-100 text-blue-700'    },
  closed:    { label: 'Cerrado',    color: 'bg-green-100 text-green-700'   },
  lost:      { label: 'Perdido',    color: 'bg-red-100 text-red-700'       },
}

function StatusBadge({ status }) {
  const cfg = STATUS_LABELS[status] ?? { label: status, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

// ── Fila de edición — solo desktop ────────────────────────────────────────────
function EditRow({ sale, onSave, onCancel }) {
  const [status,   setStatus]   = useState(sale.status)
  const [followUp, setFollowUp] = useState(sale.follow_up_date?.split('T')[0] ?? '')
  const [notes,    setNotes]    = useState(sale.notes ?? '')
  const [saving,   setSaving]   = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(sale.id, { status, follow_up_date: followUp || null, notes: notes || null })
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr className="bg-green-50">
      <td className="px-4 py-3 text-xs text-gray-500">
        {new Date(sale.created_at).toLocaleDateString('es-PE')}
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900">{sale.client_name}</p>
        <p className="text-xs text-gray-500">{sale.client_phone}</p>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{sale.operator_name}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{sale.plan_name}</td>
      <td className="px-4 py-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
        >
          {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-green-700">
        S/ {parseFloat(sale.commission_amount).toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <input
          type="date"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 w-full"
        />
      </td>
      <td className="px-4 py-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 w-full resize-none"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-2 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? '...' : 'Guardar'}
          </button>
          <button
            onClick={onCancel}
            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Card de edición — solo mobile ─────────────────────────────────────────────
function EditCard({ sale, onSave, onCancel }) {
  const [status,   setStatus]   = useState(sale.status)
  const [followUp, setFollowUp] = useState(sale.follow_up_date?.split('T')[0] ?? '')
  const [notes,    setNotes]    = useState(sale.notes ?? '')
  const [saving,   setSaving]   = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(sale.id, { status, follow_up_date: followUp || null, notes: notes || null })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-green-50 rounded-xl border border-green-200 p-4 space-y-3">
      <p className="font-semibold text-gray-900">{sale.client_name}</p>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Estado</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
        >
          {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Fecha seguimiento</label>
        <input
          type="date"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg
                     hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg
                     hover:bg-gray-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function MySales() {
  const [sales,   setSales]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [editId,  setEditId]  = useState(null)

  const [filters, setFilters] = useState({ status: '', month: '', page: 1 })

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const p = { limit: 20, ...filters }
      if (!p.status) delete p.status
      if (!p.month)  delete p.month
      const res = await sellerService.getSales(p)
      setSales(res.sales ?? [])
      setTotal(res.total ?? 0)
    } catch (err) {
      setError(err.message || 'Error al cargar ventas')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchSales() }, [fetchSales])

  const handleUpdate = async (id, fields) => {
    try {
      const updated = await sellerService.updateSale(id, fields)
      setSales(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s))
      setEditId(null)
    } catch (err) {
      alert(err.message || 'Error al actualizar')
    }
  }

  const setFilter = (key) => (e) =>
    setFilters(prev => ({ ...prev, [key]: e.target.value, page: 1 }))

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return { value: `${y}-${m}`, label: `${m}/${y}` }
  })

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Mis Ventas</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-gray-100
                      shadow-sm p-3 md:p-4 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Estado</label>
          <select
            value={filters.status}
            onChange={setFilter('status')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
          >
            <option value="">Todos</option>
            {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Mes</label>
          <select
            value={filters.month}
            onChange={setFilter('month')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
          >
            <option value="">Todos</option>
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto text-xs text-gray-400 self-end pb-1">
          {total} registro{total !== 1 ? 's' : ''}
        </div>
      </div>

      {error && (
        <div className="text-center py-8">
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button onClick={fetchSales}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-gray-100 rounded-xl h-64 animate-pulse" />
      ) : sales.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center">
          <p className="text-gray-400 text-sm">Sin ventas con estos filtros</p>
        </div>
      ) : (
        <>
          {/* ── VISTA MOBILE: cards ──────────────────────────────────── */}
          <div className="md:hidden space-y-3">
            {sales.map(sale =>
              editId === sale.id ? (
                <EditCard
                  key={sale.id}
                  sale={sale}
                  onSave={handleUpdate}
                  onCancel={() => setEditId(null)}
                />
              ) : (
                <div key={sale.id}
                     className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2.5">
                  {/* Nombre + celular */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{sale.client_name}</p>
                      <a href={`tel:${sale.client_phone}`}
                         className="text-sm text-blue-600 hover:underline">
                        📞 {sale.client_phone}
                      </a>
                    </div>
                    <StatusBadge status={sale.status} />
                  </div>

                  {/* Operador + plan */}
                  <p className="text-xs text-gray-500">
                    {sale.operator_name} · {sale.plan_name}
                  </p>

                  {/* Comisión */}
                  <p className="text-sm font-semibold text-green-700">
                    💰 S/ {parseFloat(sale.commission_amount).toFixed(2)} de comisión
                  </p>

                  {/* Seguimiento */}
                  {sale.follow_up_date && (
                    <p className="text-xs text-orange-500 font-medium">
                      📅 Seguimiento:{' '}
                      {formatDate(sale.follow_up_date)}
                    </p>
                  )}

                  {/* Notas */}
                  {sale.notes && (
                    <p className="text-xs text-gray-400 italic truncate">
                      "{sale.notes}"
                    </p>
                  )}

                  {/* Fecha registro + editar */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                    <span className="text-xs text-gray-400">
                      {new Date(sale.created_at).toLocaleDateString('es-PE')}
                    </span>
                    <button
                      onClick={() => setEditId(sale.id)}
                      className="text-xs text-blue-600 font-medium hover:underline px-2 py-1"
                    >
                      ✏️ Editar
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          {/* ── VISTA DESKTOP: tabla ──────────────────────────────────── */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-100
                          shadow-sm overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Fecha','Cliente','Operador','Plan','Estado','Comisión','Seguimiento','Notas',''].map(h => (
                    <th key={h}
                        className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sales.map(sale =>
                  editId === sale.id ? (
                    <EditRow
                      key={sale.id}
                      sale={sale}
                      onSave={handleUpdate}
                      onCancel={() => setEditId(null)}
                    />
                  ) : (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(sale.created_at).toLocaleDateString('es-PE')}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{sale.client_name}</p>
                        <a href={`tel:${sale.client_phone}`}
                           className="text-xs text-blue-600 hover:underline">
                          {sale.client_phone}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{sale.operator_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{sale.plan_name}</td>
                      <td className="px-4 py-3"><StatusBadge status={sale.status} /></td>
                      <td className="px-4 py-3 text-sm font-medium text-green-700 whitespace-nowrap">
                        S/ {parseFloat(sale.commission_amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {sale.follow_up_date
                          ? formatDate(sale.follow_up_date)
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[150px] truncate">
                        {sale.notes || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setEditId(sale.id)}
                          className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Paginación */}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={filters.page <= 1}
            onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
            className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg
                       hover:bg-gray-50 disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">
            {filters.page} / {totalPages}
          </span>
          <button
            disabled={filters.page >= totalPages}
            onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
            className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg
                       hover:bg-gray-50 disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
