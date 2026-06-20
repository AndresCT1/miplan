import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { sellerService } from '../../services/api'

export default function NewSale() {
  const navigate       = useNavigate()
  const [params]       = useSearchParams()

  const [catalog,    setCatalog]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState(null)
  const [error,      setError]      = useState('')

  const [form, setForm] = useState({
    clientName:    '',
    clientPhone:   '',
    operatorId:    params.get('operatorId') || '',
    planId:        params.get('planId')     || '',
    followUpDate:  '',
    notes:         '',
  })

  const fetchCatalog = useCallback(async () => {
    try {
      const data = await sellerService.getCatalog()
      setCatalog(data)
    } catch {
      setError('Error al cargar el catálogo')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCatalog() }, [fetchCatalog])

  const selectedOp   = catalog.find(op => String(op.id) === String(form.operatorId))
  const selectedPlan = selectedOp?.plans?.find(p => String(p.id) === String(form.planId))
  const commissionPct = parseFloat(selectedOp?.commission_pct ?? 0)
  const commissionAmt = selectedPlan
    ? (parseFloat(selectedPlan.price) * commissionPct / 100).toFixed(2)
    : null

  const set = (field) => (e) => {
    const val = e.target.value
    setForm(prev => {
      const next = { ...prev, [field]: val }
      if (field === 'operatorId') next.planId = ''
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.clientName.trim()) { setError('El nombre del cliente es requerido'); return }
    if (!/^9\d{8}$/.test(form.clientPhone)) {
      setError('Celular inválido (debe empezar con 9 y tener 9 dígitos)')
      return
    }
    if (!form.operatorId) { setError('Selecciona un operador'); return }
    if (!form.planId)     { setError('Selecciona un plan'); return }

    setSubmitting(true)
    setError('')
    try {
      const sale = await sellerService.createSale({
        clientName:   form.clientName.trim(),
        clientPhone:  form.clientPhone,
        operatorId:   parseInt(form.operatorId, 10),
        planId:       parseInt(form.planId,     10),
        followUpDate: form.followUpDate || undefined,
        notes:        form.notes        || undefined,
      })
      setSuccess(sale)
    } catch (err) {
      setError(err.message || 'Error al registrar la venta')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (success) return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-gray-900">Venta registrada</h2>
        <p className="text-gray-500">
          Cliente: <strong>{success.client_name}</strong>
        </p>
        {parseFloat(success.commission_amount) > 0 ? (
          <div className="bg-green-50 rounded-xl px-6 py-4">
            <p className="text-sm text-green-700">Comisión ganada</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              S/ {parseFloat(success.commission_amount).toFixed(2)}
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 rounded-xl px-6 py-4">
            <p className="text-sm text-amber-700">
              La comisión para este operador aún no está configurada
            </p>
          </div>
        )}
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => { setSuccess(null); setForm({ clientName:'',clientPhone:'',operatorId:'',planId:'',followUpDate:'',notes:'' }) }}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700"
          >
            Registrar otra venta
          </button>
          <button
            onClick={() => navigate('/equipo/ventas')}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200"
          >
            Ver mis ventas
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Registrar nueva venta</h1>

      <form onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del cliente
          </label>
          <input
            type="text"
            value={form.clientName}
            onChange={set('clientName')}
            placeholder="Juan Pérez"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Celular del cliente
          </label>
          <input
            type="tel"
            value={form.clientPhone}
            onChange={set('clientPhone')}
            placeholder="9XXXXXXXX"
            maxLength={9}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Operador
          </label>
          <select
            value={form.operatorId}
            onChange={set('operatorId')}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Selecciona un operador</option>
            {catalog.map(op => (
              <option key={op.id} value={op.id}>{op.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plan
          </label>
          <select
            value={form.planId}
            onChange={set('planId')}
            disabled={!selectedOp}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500 bg-white
                       disabled:opacity-50"
          >
            <option value="">Selecciona un plan</option>
            {selectedOp?.plans?.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — S/ {parseFloat(p.price).toFixed(2)}/mes
              </option>
            ))}
          </select>
        </div>

        {selectedPlan && (
          <div className={`rounded-xl px-4 py-3 ${commissionPct > 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
            {commissionPct > 0 ? (
              <p className="text-sm font-medium text-green-700">
                Ganarás S/ {commissionAmt} de comisión ({commissionPct}%)
              </p>
            ) : (
              <p className="text-sm text-amber-700">
                Comisión pendiente de configurar por el administrador
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de seguimiento (opcional)
          </label>
          <input
            type="date"
            value={form.followUpDate}
            onChange={set('followUpDate')}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={form.notes}
            onChange={set('notes')}
            rows={3}
            placeholder="Observaciones sobre el cliente o la venta..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold
                     text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Guardando...
            </>
          ) : 'Registrar venta'}
        </button>
      </form>
    </div>
  )
}
