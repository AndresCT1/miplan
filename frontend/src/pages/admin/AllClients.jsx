import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services/api'

function ConfirmModal({ client, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="text-center">
          <p className="text-3xl mb-3">💸</p>
          <h3 className="text-lg font-semibold text-gray-900">Confirmar pago</h3>
          <p className="text-sm text-gray-600 mt-2">
            ¿Confirmas el pago de{' '}
            <strong className="text-green-700">S/ {parseFloat(client.commission_amount).toFixed(2)}</strong>{' '}
            a <strong>{client.seller_name}</strong> por el cliente{' '}
            <strong>{client.client_name}</strong>?
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">
            Cancelar
          </button>
          <button onClick={handleConfirm} disabled={loading}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Pagando...</>
              : '✅ Confirmar pago'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AllClients() {
  const [clients,      setClients]      = useState([])
  const [total,        setTotal]        = useState(0)
  const [pendingTotal, setPendingTotal] = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [confirmClient,setConfirmClient]= useState(null)
  const [filters,      setFilters]      = useState({ status: '', sellerId: '', page: 1 })
  const [sellers,      setSellers]      = useState([])

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const [res, selRes] = await Promise.all([
        adminService.getAllClients({ ...filters, limit: 30 }),
        sellers.length ? Promise.resolve(sellers) : adminService.getSellers(),
      ])
      setClients(res.clients ?? [])
      setTotal(res.total ?? 0)
      setPendingTotal(res.pendingTotal ?? 0)
      if (!sellers.length) setSellers(selRes ?? [])
    } catch (err) {
      setError(err.message || 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchClients() }, [fetchClients])

  const handleMarkPaid = async () => {
    try {
      const updated = await adminService.markCommissionPaid(confirmClient.id)
      setClients(prev => prev.map(c => c.id === updated.id ? { ...c, commission_status: 'paid', commission_paid_at: updated.commission_paid_at } : c))
      setConfirmClient(null)
      // Recalcular pendingTotal
      setPendingTotal(prev => Math.max(0, prev - parseFloat(confirmClient.commission_amount)))
    } catch (err) {
      alert(err.message || 'Error al marcar como pagado')
      setConfirmClient(null)
    }
  }

  const setFilter = (f) => (e) => setFilters(p => ({ ...p, [f]: e.target.value, page: 1 }))

  return (
    <div className="space-y-5">
      {/* Header con total pendiente */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Comisiones de clientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} cliente{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-orange-600 font-medium">Total pendiente</p>
          <p className="text-2xl font-bold text-orange-700">S/ {pendingTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Estado</label>
          <select value={filters.status} onChange={setFilter('status')}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
            <option value="">Todos</option>
            <option value="pending">⏳ Pendiente</option>
            <option value="paid">✅ Pagado</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Vendedor</label>
          <select value={filters.sellerId} onChange={setFilter('sellerId')}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
            <option value="">Todos</option>
            {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {loading && <div className="bg-gray-100 rounded-xl h-64 animate-pulse" />}
      {error   && <p className="text-red-600 text-sm text-center py-8">{error}</p>}

      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {clients.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p>Sin clientes con estos filtros</p>
            </div>
          ) : (
            <>
              {/* Mobile: cards */}
              <div className="md:hidden divide-y divide-gray-50">
                {clients.map(c => (
                  <div key={c.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{c.client_name}</p>
                        <p className="text-xs text-gray-500">{c.seller_name}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0
                        ${c.commission_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {c.commission_status === 'paid' ? '✅ Pagada' : '⏳ Pendiente'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{c.operator_name} · {c.plan_name}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-green-700">S/ {parseFloat(c.commission_amount).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(c.installation_date + 'T00:00:00').toLocaleDateString('es-PE')}
                      </p>
                    </div>
                    {c.commission_status === 'pending' && (
                      <button
                        onClick={() => setConfirmClient(c)}
                        className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Marcar como pagado
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop: tabla */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Vendedor','Cliente','Operador','Plan','Instalación','Comisión','Estado','Acción'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {clients.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{c.seller_name}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{c.client_name}</p>
                          {c.client_phone && <p className="text-xs text-gray-400">{c.client_phone}</p>}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{c.operator_name}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{c.plan_name}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(c.installation_date + 'T00:00:00').toLocaleDateString('es-PE')}
                        </td>
                        <td className="px-4 py-3 font-bold text-green-700 whitespace-nowrap">
                          S/ {parseFloat(c.commission_amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                            ${c.commission_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {c.commission_status === 'paid' ? '✅ Pagada' : '⏳ Pendiente'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {c.commission_status === 'pending' ? (
                            <button
                              onClick={() => setConfirmClient(c)}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                            >
                              Marcar pagado
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              {c.commission_paid_at
                                ? new Date(c.commission_paid_at).toLocaleDateString('es-PE')
                                : '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {confirmClient && (
        <ConfirmModal
          client={confirmClient}
          onConfirm={handleMarkPaid}
          onClose={() => setConfirmClient(null)}
        />
      )}
    </div>
  )
}
