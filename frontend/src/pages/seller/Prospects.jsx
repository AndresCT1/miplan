import { useState, useEffect, useCallback, useMemo } from 'react'
import { sellerService } from '../../services/api'

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUSES = [
  { key: 'nuevo',      label: 'Nuevo',      color: 'bg-blue-100 text-blue-700'    },
  { key: 'contactado', label: 'Contactado', color: 'bg-purple-100 text-purple-700'},
  { key: 'interesado', label: 'Interesado', color: 'bg-yellow-100 text-yellow-700'},
  { key: 'propuesta',  label: 'Propuesta',  color: 'bg-orange-100 text-orange-700'},
  { key: 'cerrado',    label: 'Cerrado',    color: 'bg-green-100 text-green-700'  },
  { key: 'perdido',    label: 'Perdido',    color: 'bg-red-100 text-red-700'      },
]
const SOURCES = ['facebook','instagram','referido','whatsapp','otro']

const todayStr = () => new Date().toISOString().split('T')[0]

function daysSinceDate(dateStr) {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000)
}

function StatusBadge({ status }) {
  const s = STATUSES.find(x => x.key === status) ?? { label: status, color: 'bg-gray-100 text-gray-600' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
}

// B — Badge de días sin contactar (usa updated_at)
function ContactBadge({ updatedAt }) {
  const days = daysSinceDate(updatedAt)
  if (days === null) return null

  if (days <= 1) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
        {days === 0 ? 'Contactado hoy' : 'Contactado ayer'}
      </span>
    )
  }
  if (days <= 3) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
        ⚠️ {days} días sin contacto
      </span>
    )
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      🔴 {days} días sin contacto
    </span>
  )
}

function extractRegularPrice(features = []) {
  const feat = features.find(f => f.toLowerCase().startsWith('precio regular:'))
  if (!feat) return null
  const m = feat.match(/S\/([\d.]+)/)
  return m ? parseFloat(m[1]) : null
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
        prospectName:    form.prospectName.trim(),
        prospectPhone:   form.prospectPhone || undefined,
        operatorId:      form.operatorId ? parseInt(form.operatorId) : undefined,
        planId:          form.planId     ? parseInt(form.planId)     : undefined,
        source:          form.source,
        nextContactDate: form.nextContactDate || undefined,
        notes:           form.notes || undefined,
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
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-xl rounded-t-2xl
                      flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo prospecto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Operador</label>
                <select value={form.operatorId} onChange={set('operatorId')}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">—</option>
                  {catalog.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
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
          </div>
          <div className="px-5 pt-3 pb-8 md:pb-4 border-t border-gray-100 bg-white shrink-0 space-y-2">
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creando...</> : 'Agregar prospecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── A — Modal: Convertir a cliente (pre-llenado) ──────────────────────────────
function ConvertModal({ prospect, catalog, onClose, onConverted }) {
  const preOp   = catalog.find(o => String(o.id) === String(prospect.operator_id))
  const prePlan = preOp?.plans?.find(p => String(p.id) === String(prospect.plan_id))
  const preRp   = prePlan ? (extractRegularPrice(prePlan.features ?? []) ?? parseFloat(prePlan.price)) : ''
  const preCp   = preOp  ? parseFloat(preOp.commission_pct ?? 0) : ''

  const [form, setForm] = useState({
    clientName:       prospect.prospect_name || '',
    clientPhone:      prospect.prospect_phone || '',
    operatorId:       prospect.operator_id ? String(prospect.operator_id) : '',
    planId:           prospect.plan_id     ? String(prospect.plan_id)     : '',
    regularPrice:     preRp ? String(preRp) : '',
    commissionPct:    preCp ? String(preCp) : '',
    installationDate: '',
    notes:            prospect.notes || '',
  })
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(null) // { commissionAmt }

  const selectedOp   = catalog.find(o => String(o.id) === String(form.operatorId))
  const selectedPlan = selectedOp?.plans?.find(p => String(p.id) === String(form.planId))

  // Auto-fill precio y comisión al cambiar plan
  useEffect(() => {
    if (!selectedPlan) return
    const rp = extractRegularPrice(selectedPlan.features ?? []) ?? parseFloat(selectedPlan.price)
    const cp = parseFloat(selectedOp?.commission_pct ?? 0)
    setForm(f => ({ ...f, regularPrice: String(rp), commissionPct: String(cp) }))
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
    if (!form.installationDate) { setError('Fecha de instalación requerida'); return }
    if (!form.regularPrice)     { setError('Precio regular requerido'); return }
    setLoading(true); setError('')
    try {
      await sellerService.convertProspect(prospect.id, {
        clientName:       form.clientName,
        clientPhone:      form.clientPhone || undefined,
        operatorId:       form.operatorId ? parseInt(form.operatorId) : undefined,
        planId:           form.planId     ? parseInt(form.planId)     : undefined,
        regularPrice:     parseFloat(form.regularPrice),
        commissionPct:    form.commissionPct ? parseFloat(form.commissionPct) : undefined,
        installationDate: form.installationDate,
        notes:            form.notes || undefined,
      })
      setSuccess({ commissionAmt })
      onConverted(prospect.id)
    } catch (err) {
      setError(err.message || 'Error al convertir')
    } finally {
      setLoading(false)
    }
  }

  // Pantalla de éxito
  if (success) return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <h3 className="text-xl font-bold text-gray-900">¡Venta cerrada!</h3>
        <p className="text-gray-600 text-sm">
          <strong>{form.clientName}</strong> fue registrado como cliente.
        </p>
        {success.commissionAmt && parseFloat(success.commissionAmt) > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4">
            <p className="text-sm text-green-700">Comisión estimada</p>
            <p className="text-3xl font-extrabold text-green-600">S/ {success.commissionAmt}</p>
          </div>
        )}
        <button onClick={onClose}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl transition-colors">
          ¡Perfecto!
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-xl rounded-t-2xl
                      flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Convertir a cliente</h2>
            <p className="text-xs text-gray-400 mt-0.5">Datos pre-llenados del prospecto</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del cliente *</label>
                <input value={form.clientName} onChange={set('clientName')}
                       className="w-full px-3 py-2.5 rounded-xl border border-green-300 bg-green-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                <input value={form.clientPhone} onChange={set('clientPhone')} maxLength={9} inputMode="numeric"
                       className="w-full px-3 py-2.5 rounded-xl border border-green-300 bg-green-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha instalación *</label>
                <input type="date" value={form.installationDate} onChange={set('installationDate')}
                       className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operador</label>
                <select value={form.operatorId} onChange={set('operatorId')}
                        className="w-full px-3 py-2.5 rounded-xl border border-green-300 bg-green-50 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">—</option>
                  {catalog.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select value={form.planId} onChange={set('planId')} disabled={!selectedOp}
                        className="w-full px-3 py-2.5 rounded-xl border border-green-300 bg-green-50 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50">
                  <option value="">—</option>
                  {selectedOp?.plans?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio regular S/ *</label>
                <input type="number" step="0.01" value={form.regularPrice} onChange={set('regularPrice')}
                       className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comisión %</label>
                <input type="number" step="0.01" value={form.commissionPct} onChange={set('commissionPct')}
                       className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            {commissionAmt && parseFloat(commissionAmt) > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <p className="text-xs text-green-600">Comisión estimada</p>
                <p className="text-2xl font-extrabold text-green-700">S/ {commissionAmt}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea value={form.notes} onChange={set('notes')} rows={2}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
            </div>
          </div>
          <div className="px-5 pt-3 pb-8 md:pb-4 border-t border-gray-100 bg-white shrink-0 space-y-2">
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Convirtiendo...</>
                : '✅ Confirmar conversión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Card de prospecto ─────────────────────────────────────────────────────────
function ProspectCard({ prospect: p, onStatusChange, onNextContact, onAttempt, onConvert }) {
  const [showActions,   setShowActions]   = useState(false)
  const [showSchedule,  setShowSchedule]  = useState(false)
  const [scheduleDate,  setScheduleDate]  = useState(p.next_contact_date?.split('T')[0] ?? '')
  const [savingDate,    setSavingDate]    = useState(false)
  const [savingAttempt, setSavingAttempt] = useState(false)

  const isToday = p.next_contact_date === todayStr()
  const isPast  = p.next_contact_date && p.next_contact_date < todayStr()

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
    <div className={`bg-white rounded-xl shadow-sm p-4 space-y-3
                     ${isToday ? 'border-2 border-green-400' : 'border border-gray-100'}`}>
      {/* Header: nombre + badge días sin contacto (B) */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{p.prospect_name}</p>
          {p.prospect_phone && (
            <a href={`tel:${p.prospect_phone}`} className="text-sm text-blue-600 hover:underline">
              📞 {p.prospect_phone}
            </a>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StatusBadge status={p.status} />
          <ContactBadge updatedAt={p.updated_at} />
        </div>
      </div>

      {/* Info secundaria */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
        {p.operator_name && <span>📡 {p.operator_name}</span>}
        {p.plan_name     && <span>· {p.plan_name}</span>}
        <span>📌 {p.source?.charAt(0).toUpperCase() + p.source?.slice(1)}</span>
        <span>📞 {p.contact_attempts} intento{p.contact_attempts !== 1 ? 's' : ''}</span>
      </div>

      {/* Próximo contacto */}
      {p.next_contact_date && (
        <p className={`text-xs font-semibold ${
          isPast   ? 'text-red-500' :
          isToday  ? 'text-green-600' : 'text-gray-500'
        }`}>
          📅 {isToday ? '¡Hoy!' : isPast ? 'Venció el' : 'Próximo:'}{' '}
          {new Date(p.next_contact_date + 'T00:00:00').toLocaleDateString('es-PE')}
        </p>
      )}

      {/* Botones rápidos */}
      {!['cerrado','perdido'].includes(p.status) && (
        <div className="flex flex-wrap gap-2 pt-1">
          <button onClick={handleAttempt} disabled={savingAttempt}
                  className="flex-1 py-2 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50">
            {savingAttempt ? '...' : '📞 Llamé ahora'}
          </button>
          <button onClick={() => setShowSchedule(v => !v)}
                  className="flex-1 py-2 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
            📅 Agendar
          </button>
          <button onClick={() => setShowActions(v => !v)}
                  className="flex-1 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            🔄 Estado
          </button>
          {['interesado','propuesta'].includes(p.status) && (
            <button onClick={() => onConvert(p)}
                    className="w-full py-2 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              ✅ Convertir a cliente
            </button>
          )}
        </div>
      )}

      {/* Selector de estado */}
      {showActions && (
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {STATUSES.map(s => (
            <button key={s.key}
                    onClick={() => { onStatusChange(p.id, s.key); setShowActions(false) }}
                    className={`py-1.5 text-xs font-medium rounded-lg transition-colors
                               ${p.status === s.key ? s.color + ' font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Agendar seguimiento */}
      {showSchedule && (
        <div className="flex gap-2 pt-1">
          <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                 className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
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

// ── Página principal ──────────────────────────────────────────────────────────
export default function Prospects() {
  const [prospects,     setProspects]     = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [catalog,       setCatalog]       = useState([])
  const [activeTab,     setActiveTab]     = useState('todos')
  const [showNewModal,  setShowNewModal]  = useState(false)
  const [convertPros,   setConvertPros]   = useState(null)
  const [showTodayOnly, setShowTodayOnly] = useState(false)

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

  // A — al convertir, marcar como cerrado en la lista
  const handleConverted = (prospectId) => {
    setProspects(prev => prev.map(p =>
      p.id === prospectId ? { ...p, status: 'cerrado', updated_at: new Date().toISOString() } : p
    ))
  }

  // C — prospectos con seguimiento hoy
  const today      = todayStr()
  const todayCount = useMemo(
    () => prospects.filter(p => p.next_contact_date === today && !['cerrado','perdido'].includes(p.status)).length,
    [prospects, today]
  )

  const tabCounts = useMemo(() => ({
    todos:      prospects.filter(p => !['cerrado','perdido'].includes(p.status)).length,
    hoy:        todayCount,
    ...Object.fromEntries(STATUSES.map(s => [s.key, prospects.filter(p => p.status === s.key).length]))
  }), [prospects, todayCount])

  const filtered = useMemo(() => {
    if (showTodayOnly || activeTab === 'hoy') {
      return prospects.filter(p => p.next_contact_date === today && !['cerrado','perdido'].includes(p.status))
    }
    if (activeTab === 'todos')   return prospects.filter(p => !['cerrado','perdido'].includes(p.status))
    if (activeTab === 'cerrado') return prospects.filter(p => p.status === 'cerrado')
    if (activeTab === 'perdido') return prospects.filter(p => p.status === 'perdido')
    return prospects.filter(p => p.status === activeTab)
  }, [prospects, activeTab, showTodayOnly, today])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Prospectos</h1>
          <p className="text-xs text-gray-400">{prospects.length} en total</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors">
          ➕ Nuevo
        </button>
      </div>

      {/* C — Banner "Para hoy" */}
      {todayCount > 0 && (
        <div className="bg-green-50 border border-green-300 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-green-800">
            📅 Tienes {todayCount} seguimiento{todayCount !== 1 ? 's' : ''} para hoy
          </p>
          <button
            onClick={() => { setShowTodayOnly(true); setActiveTab('hoy') }}
            className="text-xs font-bold text-green-700 hover:text-green-900 whitespace-nowrap
                       bg-green-100 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors"
          >
            Ver solo estos →
          </button>
        </div>
      )}

      {/* Tabs / chips de filtro */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {/* Todos */}
        {[
          { key: 'todos',    label: 'Todos'        },
          { key: 'hoy',      label: '📅 Para hoy'  },
          { key: 'nuevo',    label: 'Nuevo'        },
          { key: 'contactado', label: 'Contactado' },
          { key: 'interesado', label: 'Interesado' },
          { key: 'propuesta',  label: 'Propuesta'  },
          { key: 'cerrado',    label: 'Cerrados'   },
          { key: 'perdido',    label: 'Perdidos'   },
        ].map(tab => (
          <button key={tab.key}
            onClick={() => { setActiveTab(tab.key); setShowTodayOnly(tab.key === 'hoy') }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0
              ${activeTab === tab.key
                ? tab.key === 'hoy'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {tab.label} ({tabCounts[tab.key] ?? 0})
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({length:3}).map((_,i) => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      )}
      {error && <p className="text-red-600 text-sm text-center py-8">{error}</p>}

      {!loading && !error && (
        filtered.length === 0
          ? <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-2">🎯</p>
              <p>Sin prospectos en esta etapa</p>
            </div>
          : <div className="space-y-3">
              {filtered.map(p => (
                <ProspectCard
                  key={p.id}
                  prospect={p}
                  onStatusChange={handleStatusChange}
                  onNextContact={handleNextContact}
                  onAttempt={handleAttempt}
                  onConvert={setConvertPros}
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
