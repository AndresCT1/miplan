import { useState, useEffect, useCallback } from 'react'
import { sellerService } from '../../services/api'

function extractRegularPrice(features = []) {
  const feat = features.find(f => f.toLowerCase().startsWith('precio regular:'))
  if (!feat) return null
  const m = feat.match(/S\/([\d.]+)/)
  return m ? parseFloat(m[1]) : null
}

function formatDate(val) {
  if (!val) return 'Sin fecha'
  const d = val instanceof Date ? val : new Date(val)
  if (isNaN(d.getTime())) return 'Sin fecha'
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Modal: Nuevo cliente ──────────────────────────────────────────────────────
function NewClientModal({ catalog, onClose, onCreated }) {
  const [form, setForm] = useState({
    clientName: '', clientPhone: '', operatorId: '', planId: '',
    regularPrice: '', commissionPct: '', installationDate: '', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const selectedOp   = catalog.find(o => String(o.id) === String(form.operatorId))
  const selectedPlan = selectedOp?.plans?.find(p => String(p.id) === String(form.planId))

  // Auto-fill precio regular cuando se selecciona plan
  useEffect(() => {
    if (!selectedPlan) return
    const rp = extractRegularPrice(selectedPlan.features ?? [])
    const cp = parseFloat(selectedOp?.commission_pct ?? 0)
    setForm(f => ({
      ...f,
      regularPrice:   rp ? String(rp) : String(parseFloat(selectedPlan.price).toFixed(2)),
      commissionPct:  String(cp),
    }))
  }, [selectedPlan?.id])

  const commissionAmt = form.regularPrice && form.commissionPct
    ? (parseFloat(form.regularPrice) * parseFloat(form.commissionPct) / 100).toFixed(2)
    : null

  const set = (f) => (e) => {
    const v = e.target.value
    setForm(p => {
      const n = { ...p, [f]: v }
      if (f === 'operatorId') { n.planId = ''; n.regularPrice = ''; n.commissionPct = '' }
      return n
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.clientName.trim())   { setError('Nombre requerido'); return }
    if (!form.operatorId)          { setError('Selecciona operador'); return }
    if (!form.installationDate)    { setError('Fecha de instalación requerida'); return }
    if (!form.regularPrice)        { setError('Precio regular requerido'); return }
    setLoading(true); setError('')
    try {
      const client = await sellerService.createClient({
        clientName:       form.clientName.trim(),
        clientPhone:      form.clientPhone || undefined,
        operatorId:       parseInt(form.operatorId),
        planId:           form.planId ? parseInt(form.planId) : undefined,
        regularPrice:     parseFloat(form.regularPrice),
        commissionPct:    form.commissionPct ? parseFloat(form.commissionPct) : undefined,
        installationDate: form.installationDate,
        notes:            form.notes || undefined,
      })
      onCreated(client)
      onClose()
    } catch (err) {
      setError(err.message || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-xl
                      rounded-t-2xl flex flex-col max-h-[92vh]">
        {/* Header sticky */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo cliente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Form con campos scrollables + botón sticky */}
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del cliente *</label>
              <input type="text" value={form.clientName} onChange={set('clientName')}
                     placeholder="Juan Pérez"
                     className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
              <input type="tel" value={form.clientPhone} onChange={set('clientPhone')}
                     placeholder="9XXXXXXXX" maxLength={9} inputMode="numeric"
                     className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operador *</label>
              <select value={form.operatorId} onChange={set('operatorId')}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Seleccionar</option>
                {catalog.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select value={form.planId} onChange={set('planId')} disabled={!selectedOp}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50">
                <option value="">Seleccionar</option>
                {selectedOp?.plans?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio regular S/ *</label>
              <input type="number" step="0.01" value={form.regularPrice} onChange={set('regularPrice')}
                     placeholder="89.90"
                     className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comisión %</label>
              <input type="number" step="0.01" value={form.commissionPct} onChange={set('commissionPct')}
                     placeholder="10"
                     className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          {commissionAmt && (
            <div className="bg-green-50 rounded-xl px-4 py-2.5">
              <p className="text-sm font-semibold text-green-700">💰 Comisión estimada: S/ {commissionAmt}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de instalación *</label>
            <input type="date" value={form.installationDate} onChange={set('installationDate')}
                   className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>
        </div>

        {/* Botón sticky al fondo — pb-8 mobile por safe area, pb-4 desktop */}
        <div className="px-5 pt-3 pb-8 md:pb-4 border-t border-gray-100 bg-white shrink-0 space-y-2">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl
                             transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Registrando...</>
              : '✅ Registrar cliente'}
          </button>
        </div>
        </form>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Clients() {
  const [view,       setView]       = useState('clients') // 'clients' | 'payments'
  const [clients,    setClients]    = useState([])
  const [total,      setTotal]      = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [catalog,    setCatalog]    = useState([])
  const [showModal,  setShowModal]  = useState(false)
  const [editNotes,  setEditNotes]  = useState(null)
  const [filters,    setFilters]    = useState({ status: '', page: 1 })
  // E — Pagos
  const [payments,      setPayments]      = useState([])
  const [totalCobrado,  setTotalCobrado]  = useState(0)
  const [paymentsLoaded,setPaymentsLoaded]= useState(false)

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const [res, cat] = await Promise.all([
        sellerService.getClients({ ...filters, limit: 20 }),
        catalog.length ? Promise.resolve(catalog) : sellerService.getCatalog(),
      ])
      setClients(res.clients ?? [])
      setTotal(res.total ?? 0)
      if (!catalog.length) setCatalog(cat ?? [])
    } catch (err) {
      setError(err.message || 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchClients() }, [fetchClients])

  const handleSaveNotes = async (clientId, notes) => {
    try {
      await sellerService.updateClientNotes(clientId, notes)
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, notes } : c))
      setEditNotes(null)
    } catch (err) {
      alert(err.message || 'Error al guardar notas')
    }
  }

  // E — Cargar pagos al cambiar a esa pestaña
  useEffect(() => {
    if (view !== 'payments' || paymentsLoaded) return
    sellerService.getPayments()
      .then(res => { setPayments(res.payments ?? []); setTotalCobrado(res.total_cobrado ?? 0); setPaymentsLoaded(true) })
      .catch(() => {})
  }, [view, paymentsLoaded])

  return (
    <div className="space-y-4">
      {/* Header con tabs */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Clientes</h1>
        {view === 'clients' && (
          <button onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors">
            ➕ Nuevo cliente
          </button>
        )}
      </div>

      {/* Tabs Clientes / Mis Pagos */}
      <div className="flex gap-2">
        <button onClick={() => setView('clients')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                  ${view === 'clients' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          👥 Mis Clientes
          <span className="ml-1.5 text-xs opacity-70">({total})</span>
        </button>
        <button onClick={() => setView('payments')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                  ${view === 'payments' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          💸 Mis Pagos
        </button>
      </div>

      {/* E — Vista Pagos */}
      {view === 'payments' && (
        <div className="space-y-4">
          {totalCobrado > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-green-700 font-medium">Has cobrado en total</p>
              <p className="text-3xl font-extrabold text-green-700">S/ {totalCobrado.toFixed(2)}</p>
            </div>
          )}
          {payments.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-2">💸</p>
              <p>Aún no tienes comisiones cobradas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map(c => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{c.client_name}</p>
                      <p className="text-xs text-gray-500">{c.operator_name} · {c.plan_name}</p>
                    </div>
                    <p className="text-lg font-extrabold text-green-700 shrink-0">
                      S/ {parseFloat(c.commission_amount).toFixed(2)}
                    </p>
                  </div>
                  {c.commission_paid_at && (
                    <p className="text-xs text-gray-400 mt-2">
                      ✅ Pagado el {formatDate(c.commission_paid_at)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vista Clientes (cuando view === 'clients') */}
      {view === 'clients' && (
        <>

      {/* Filtro estado */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[['', 'Todos'], ['pending', '⏳ Pendientes'], ['paid', '✅ Pagadas']].map(([v, l]) => (
          <button key={v}
            onClick={() => setFilters(f => ({ ...f, status: v, page: 1 }))}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
              ${filters.status === v ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading && <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>}
      {error   && <p className="text-red-600 text-sm text-center py-8">{error}</p>}

      {!loading && !error && (
        <>
          {/* Mobile: cards */}
          <div className="md:hidden space-y-3">
            {clients.length === 0
              ? <div className="text-center py-16 text-gray-400"><p>Sin clientes registrados</p></div>
              : clients.map(c => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{c.client_name}</p>
                      {c.client_phone && (
                        <a href={`tel:${c.client_phone}`} className="text-sm text-blue-600 hover:underline">📞 {c.client_phone}</a>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0
                      ${c.commission_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {c.commission_status === 'paid' ? '✅ Pagada' : '⏳ Pendiente'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{c.operator_name} · {c.plan_name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-green-700">S/ {parseFloat(c.commission_amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">
                      Instalación: {formatDate(c.installation_date)}
                    </p>
                  </div>
                  {/* Notas */}
                  {editNotes?.id === c.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editNotes.notes}
                        onChange={e => setEditNotes(p => ({ ...p, notes: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveNotes(c.id, editNotes.notes)}
                                className="flex-1 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700">Guardar</button>
                        <button onClick={() => setEditNotes(null)}
                                className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setEditNotes({ id: c.id, notes: c.notes || '' })}
                            className="text-xs text-blue-600 hover:underline self-start">
                      {c.notes ? `📝 ${c.notes.substring(0, 40)}...` : '+ Agregar nota'}
                    </button>
                  )}
                </div>
              ))}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            {clients.length === 0
              ? <p className="text-center py-16 text-gray-400">Sin clientes registrados</p>
              : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100">
                    {['Cliente','Operador','Plan','Instalación','Comisión','Estado','Notas'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {clients.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{c.client_name}</p>
                          {c.client_phone && <a href={`tel:${c.client_phone}`} className="text-xs text-blue-600 hover:underline">{c.client_phone}</a>}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{c.operator_name}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{c.plan_name}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(c.installation_date)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-700 whitespace-nowrap">
                          S/ {parseFloat(c.commission_amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                            ${c.commission_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {c.commission_status === 'paid' ? '✅ Pagada' : '⏳ Pendiente'}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[160px]">
                          {editNotes?.id === c.id ? (
                            <div className="flex gap-1">
                              <input value={editNotes.notes} onChange={e => setEditNotes(p => ({ ...p, notes: e.target.value }))}
                                     className="flex-1 text-xs border border-gray-200 rounded px-2 py-1" />
                              <button onClick={() => handleSaveNotes(c.id, editNotes.notes)} className="text-xs text-green-600 font-medium">✓</button>
                              <button onClick={() => setEditNotes(null)} className="text-xs text-gray-400">✕</button>
                            </div>
                          ) : (
                            <button onClick={() => setEditNotes({ id: c.id, notes: c.notes || '' })}
                                    className="text-xs text-blue-600 hover:underline truncate block max-w-full">
                              {c.notes ? c.notes.substring(0, 30) + (c.notes.length > 30 ? '...' : '') : '+ Nota'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        </>
      )}
      </>
      )}

      {showModal && (
        <NewClientModal
          catalog={catalog}
          onClose={() => setShowModal(false)}
          onCreated={c => setClients(prev => [c, ...prev])}
        />
      )}
    </div>
  )
}
