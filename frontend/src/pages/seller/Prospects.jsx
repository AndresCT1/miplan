import { useState, useEffect, useCallback } from 'react'
import { sellerService } from '../../services/api'

const STATUSES = [
  { key: 'nuevo',      label: 'Nuevo',      color: 'bg-blue-100 text-blue-700'    },
  { key: 'contactado', label: 'Contactado', color: 'bg-purple-100 text-purple-700'},
  { key: 'interesado', label: 'Interesado', color: 'bg-yellow-100 text-yellow-700'},
  { key: 'propuesta',  label: 'Propuesta',  color: 'bg-orange-100 text-orange-700'},
  { key: 'cerrado',    label: 'Cerrado',    color: 'bg-green-100 text-green-700'  },
  { key: 'perdido',    label: 'Perdido',    color: 'bg-red-100 text-red-700'      },
]
const TABS = STATUSES.slice(0, 4).concat({ key: 'todos', label: 'Todos', color: 'bg-gray-100 text-gray-700' })

const SOURCES = ['facebook','instagram','referido','whatsapp','otro']

function daysSince(dateStr) {
  if (!dateStr) return null
  const d = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  return d
}

function StatusBadge({ status }) {
  const s = STATUSES.find(x => x.key === status) ?? { label: status, color: 'bg-gray-100 text-gray-600' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
}

// ── Modal: Nuevo prospecto ────────────────────────────────────────────────────
function NewProspectModal({ catalog, onClose, onCreated }) {
  const [form, setForm] = useState({
    prospectName: '', prospectPhone: '', operatorId: '', planId: '',
    source: 'otro', nextContactDate: '', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (f) => (e) => setForm(p => {
    const n = { ...p, [f]: e.target.value }
    if (f === 'operatorId') n.planId = ''
    return n
  })
  const selectedOp = catalog.find(o => String(o.id) === String(form.operatorId))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.prospectName.trim()) { setError('Nombre requerido'); return }
    setLoading(true); setError('')
    try {
      const p = await sellerService.createProspect({
        prospectName:     form.prospectName.trim(),
        prospectPhone:    form.prospectPhone || undefined,
        operatorId:       form.operatorId ? parseInt(form.operatorId) : undefined,
        planId:           form.planId     ? parseInt(form.planId)     : undefined,
        source:           form.source,
        nextContactDate:  form.nextContactDate || undefined,
        notes:            form.notes || undefined,
      })
      onCreated(p)
      onClose()
    } catch (err) {
      setError(err.message || 'Error al crear')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-xl
                      rounded-t-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo prospecto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" value={form.prospectName} onChange={set('prospectName')} placeholder="Juan Pérez"
                     className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
              <input type="tel" value={form.prospectPhone} onChange={set('prospectPhone')} placeholder="9XXXXXXXX" maxLength={9} inputMode="numeric"
                     className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fuente</label>
            <select value={form.source} onChange={set('source')}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
              {SOURCES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operador interés</label>
              <select value={form.operatorId} onChange={set('operatorId')}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">—</option>
                {catalog.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan interés</label>
              <select value={form.planId} onChange={set('planId')} disabled={!selectedOp}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50">
                <option value="">—</option>
                {selectedOp?.plans?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Próximo contacto</label>
            <input type="date" value={form.nextContactDate} onChange={set('nextContactDate')}
                   className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creando...</> : 'Agregar prospecto'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Card de prospecto ─────────────────────────────────────────────────────────
function ProspectCard({ prospect: p, onStatusChange, onNextContact, onAttempt, onConvert, onUpdate }) {
  const [showActions,   setShowActions]   = useState(false)
  const [showSchedule,  setShowSchedule]  = useState(false)
  const [scheduleDate,  setScheduleDate]  = useState(p.next_contact_date?.split('T')[0] ?? '')
  const [savingDate,    setSavingDate]    = useState(false)
  const [savingAttempt, setSavingAttempt] = useState(false)

  const days = daysSince(p.created_at)

  const handleAttempt = async () => {
    setSavingAttempt(true)
    await onAttempt(p.id)
    setSavingAttempt(false)
    setShowActions(true)
  }

  const handleSaveDate = async () => {
    setSavingDate(true)
    await onNextContact(p.id, scheduleDate)
    setSavingDate(false)
    setShowSchedule(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900">{p.prospect_name}</p>
          {p.prospect_phone && (
            <a href={`tel:${p.prospect_phone}`} className="text-sm text-blue-600 hover:underline">📞 {p.prospect_phone}</a>
          )}
        </div>
        <StatusBadge status={p.status} />
      </div>

      {/* Info */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {p.operator_name && <span>📡 {p.operator_name}</span>}
        <span>📌 {p.source?.charAt(0).toUpperCase() + p.source?.slice(1)}</span>
        {days !== null && <span>🕐 Hace {days} días</span>}
        <span>📞 {p.contact_attempts} intento{p.contact_attempts !== 1 ? 's' : ''}</span>
      </div>

      {/* Próximo contacto */}
      {p.next_contact_date && (
        <p className={`text-xs font-medium ${
          new Date(p.next_contact_date + 'T00:00:00') <= new Date() ? 'text-orange-500' : 'text-gray-500'
        }`}>
          📅 Próximo: {new Date(p.next_contact_date + 'T00:00:00').toLocaleDateString('es-PE')}
        </p>
      )}

      {/* Botones rápidos */}
      {!['cerrado','perdido'].includes(p.status) && (
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={handleAttempt}
            disabled={savingAttempt}
            className="flex-1 py-2 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {savingAttempt ? '...' : '📞 Llamé ahora'}
          </button>
          <button
            onClick={() => setShowSchedule(v => !v)}
            className="flex-1 py-2 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            📅 Agendar
          </button>
          <button
            onClick={() => setShowActions(v => !v)}
            className="flex-1 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            🔄 Estado
          </button>
          {['interesado','propuesta'].includes(p.status) && (
            <button
              onClick={() => onConvert(p)}
              className="flex-1 py-2 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ✅ Convertir
            </button>
          )}
        </div>
      )}

      {/* Selector de estado */}
      {showActions && (
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {STATUSES.map(s => (
            <button
              key={s.key}
              onClick={() => { onStatusChange(p.id, s.key); setShowActions(false) }}
              className={`py-1.5 text-xs font-medium rounded-lg transition-colors
                         ${p.status === s.key ? s.color + ' font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Agendar seguimiento */}
      {showSchedule && (
        <div className="flex gap-2 pt-1">
          <input
            type="date"
            value={scheduleDate}
            onChange={e => setScheduleDate(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button onClick={handleSaveDate} disabled={savingDate}
                  className="px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50">
            {savingDate ? '...' : 'OK'}
          </button>
          <button onClick={() => setShowSchedule(false)}
                  className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200">
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

// ── Modal: Convertir a cliente ────────────────────────────────────────────────
function ConvertModal({ prospect, catalog, onClose, onConverted }) {
  const [form, setForm] = useState({
    clientName:       prospect.prospect_name,
    clientPhone:      prospect.prospect_phone || '',
    operatorId:       prospect.operator_id ? String(prospect.operator_id) : '',
    planId:           prospect.plan_id     ? String(prospect.plan_id)     : '',
    regularPrice:     '',
    commissionPct:    '',
    installationDate: '',
    notes:            prospect.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const selectedOp   = catalog.find(o => String(o.id) === String(form.operatorId))
  const selectedPlan = selectedOp?.plans?.find(p => String(p.id) === String(form.planId))

  useEffect(() => {
    if (!selectedPlan) return
    const feat = selectedPlan.features ?? []
    const rp   = feat.find(f => f.toLowerCase().startsWith('precio regular:'))
    const m    = rp?.match(/S\/([\d.]+)/)
    const cp   = parseFloat(selectedOp?.commission_pct ?? 0)
    setForm(f => ({ ...f, regularPrice: m ? m[1] : String(parseFloat(selectedPlan.price).toFixed(2)), commissionPct: String(cp) }))
  }, [selectedPlan?.id])

  const commAmt = form.regularPrice && form.commissionPct
    ? (parseFloat(form.regularPrice) * parseFloat(form.commissionPct) / 100).toFixed(2) : null

  const set = (f) => (e) => {
    const v = e.target.value
    setForm(p => { const n = { ...p, [f]: v }; if (f === 'operatorId') { n.planId = ''; n.regularPrice = ''; n.commissionPct = '' }; return n })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.installationDate) { setError('Fecha de instalación requerida'); return }
    if (!form.regularPrice)     { setError('Precio regular requerido'); return }
    setLoading(true); setError('')
    try {
      const result = await sellerService.convertProspect(prospect.id, {
        clientName:       form.clientName, clientPhone: form.clientPhone || undefined,
        operatorId:       form.operatorId ? parseInt(form.operatorId) : undefined,
        planId:           form.planId     ? parseInt(form.planId)     : undefined,
        regularPrice:     parseFloat(form.regularPrice),
        commissionPct:    form.commissionPct ? parseFloat(form.commissionPct) : undefined,
        installationDate: form.installationDate, notes: form.notes || undefined,
      })
      onConverted(result)
      onClose()
    } catch (err) {
      setError(err.message || 'Error al convertir')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-xl rounded-t-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Convertir a cliente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input value={form.clientName} onChange={set('clientName')} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
              <input value={form.clientPhone} onChange={set('clientPhone')} maxLength={9} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha instalación *</label>
              <input type="date" value={form.installationDate} onChange={set('installationDate')} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operador</label>
              <select value={form.operatorId} onChange={set('operatorId')} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">—</option>
                {catalog.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select value={form.planId} onChange={set('planId')} disabled={!selectedOp} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50">
                <option value="">—</option>
                {selectedOp?.plans?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio regular S/ *</label>
              <input type="number" step="0.01" value={form.regularPrice} onChange={set('regularPrice')} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comisión %</label>
              <input type="number" step="0.01" value={form.commissionPct} onChange={set('commissionPct')} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          {commAmt && <div className="bg-green-50 rounded-xl px-4 py-2.5"><p className="text-sm font-semibold text-green-700">💰 Comisión: S/ {commAmt}</p></div>}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Convirtiendo...</> : '✅ Confirmar conversión'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Prospects() {
  const [prospects,    setProspects]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [catalog,      setCatalog]      = useState([])
  const [activeTab,    setActiveTab]    = useState('todos')
  const [showNewModal, setShowNewModal] = useState(false)
  const [convertPros,  setConvertPros]  = useState(null)

  const fetchProspects = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const [res, cat] = await Promise.all([
        sellerService.getProspects({ limit: 100 }),
        catalog.length ? Promise.resolve(catalog) : sellerService.getCatalog(),
      ])
      setProspects(res.prospects ?? [])
      if (!catalog.length) setCatalog(cat ?? [])
    } catch (err) {
      setError(err.message || 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProspects() }, [fetchProspects])

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await sellerService.updateProspectStatus(id, status)
      setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
    } catch (err) { alert(err.message) }
  }

  const handleNextContact = async (id, date) => {
    try {
      const updated = await sellerService.updateProspectNextContact(id, date)
      setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
    } catch (err) { alert(err.message) }
  }

  const handleAttempt = async (id) => {
    try {
      const updated = await sellerService.incrementAttempt(id)
      setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
    } catch (err) { alert(err.message) }
  }

  const handleConverted = ({ prospect }) => {
    setProspects(prev => prev.map(p => p.id === prospect.id ? { ...p, ...prospect } : p))
  }

  const filtered = activeTab === 'todos'
    ? prospects.filter(p => !['cerrado','perdido'].includes(p.status))
    : prospects.filter(p => p.status === activeTab)

  const tabCounts = {
    todos: prospects.filter(p => !['cerrado','perdido'].includes(p.status)).length,
    ...Object.fromEntries(STATUSES.map(s => [s.key, prospects.filter(p => p.status === s.key).length]))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Prospectos</h1>
          <p className="text-xs text-gray-400">{prospects.length} en total</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          ➕ Nuevo
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0
              ${activeTab === tab.key ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {tab.label} ({tabCounts[tab.key] ?? 0})
          </button>
        ))}
        <button
          onClick={() => setActiveTab('cerrado')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0
            ${activeTab === 'cerrado' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Cerrados ({tabCounts.cerrado ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('perdido')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0
            ${activeTab === 'perdido' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Perdidos ({tabCounts.perdido ?? 0})
        </button>
      </div>

      {loading && <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}</div>}
      {error   && <p className="text-red-600 text-sm text-center py-8">{error}</p>}

      {!loading && !error && (
        filtered.length === 0
          ? <div className="text-center py-16 text-gray-400"><p className="text-4xl mb-2">🎯</p><p>Sin prospectos en esta etapa</p></div>
          : <div className="space-y-3">
              {filtered.map(p => (
                <ProspectCard
                  key={p.id}
                  prospect={p}
                  onStatusChange={handleStatusChange}
                  onNextContact={handleNextContact}
                  onAttempt={handleAttempt}
                  onConvert={setConvertPros}
                  onUpdate={(updated) => setProspects(prev => prev.map(x => x.id === p.id ? { ...x, ...updated } : x))}
                />
              ))}
            </div>
      )}

      {showNewModal && (
        <NewProspectModal
          catalog={catalog}
          onClose={() => setShowNewModal(false)}
          onCreated={p => setProspects(prev => [p, ...prev])}
        />
      )}
      {convertPros && (
        <ConvertModal
          prospect={convertPros}
          catalog={catalog}
          onClose={() => setConvertPros(null)}
          onConverted={handleConverted}
        />
      )}
    </div>
  )
}
