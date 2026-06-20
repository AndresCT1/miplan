import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services/api'

function validate(raw) {
  const v = parseFloat(raw)
  if (isNaN(v))        return 'Ingresa un número válido'
  if (v < 0)           return 'Mínimo 0%'
  if (v > 100)         return 'Máximo 100%'
  if (!/^\d{0,3}(\.\d{0,2})?$/.test(String(raw).trim())) return 'Máximo 2 decimales'
  return null
}

function CommissionRow({ operator, onSave }) {
  const [value,   setValue]   = useState(String(parseFloat(operator.commission_pct).toFixed(2)))
  const [dirty,   setDirty]   = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [errMsg,  setErrMsg]  = useState(null)

  const handleChange = (e) => {
    setValue(e.target.value)
    setDirty(true)
    setSaved(false)
    setErrMsg(null)
  }

  const handleSave = async () => {
    const err = validate(value)
    if (err) { setErrMsg(err); return }
    setSaving(true)
    try {
      await onSave(operator.id, parseFloat(value))
      setSaved(true)
      setDirty(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setErrMsg(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {operator.logo_url && (
            <img src={operator.logo_url} alt={operator.name} className="h-7 object-contain" />
          )}
          <span className="font-medium text-gray-900 text-sm">{operator.name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="relative w-32">
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={value}
              onChange={handleChange}
              className={`w-full px-3 py-2 pr-7 rounded-lg border text-sm
                          focus:outline-none focus:ring-2 focus:ring-blue-500
                          ${errMsg ? 'border-red-400' : 'border-gray-200'}`}
            />
            <span className="absolute right-2.5 top-2.5 text-gray-400 text-sm">%</span>
          </div>
          {errMsg && <p className="text-red-500 text-xs">{errMsg}</p>}
        </div>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${saved
                        ? 'bg-green-100 text-green-700'
                        : dirty
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar'}
        </button>
      </td>
    </tr>
  )
}

export default function Commissions() {
  const [operators, setOperators] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [allValues, setAllValues] = useState({})
  const [globalMsg, setGlobalMsg] = useState(null)

  const fetchCommissions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getCommissions()
      setOperators(data)
      const initial = {}
      data.forEach(op => { initial[op.id] = String(parseFloat(op.commission_pct).toFixed(2)) })
      setAllValues(initial)
    } catch (err) {
      setError(err.message || 'Error al cargar comisiones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCommissions() }, [fetchCommissions])

  const handleSaveOne = async (operatorId, pct) => {
    await adminService.updateCommission(operatorId, pct)
    setOperators(prev =>
      prev.map(op => op.id === operatorId ? { ...op, commission_pct: pct } : op)
    )
  }

  const handleSaveAll = async () => {
    const errs = []
    Object.entries(allValues).forEach(([id, val]) => {
      if (validate(val)) errs.push(validate(val))
    })
    if (errs.length) { setGlobalMsg({ type: 'error', text: errs[0] }); return }

    setSaving(true)
    setGlobalMsg(null)
    try {
      await Promise.all(
        operators.map(op =>
          adminService.updateCommission(op.id, parseFloat(allValues[op.id] ?? op.commission_pct))
        )
      )
      setGlobalMsg({ type: 'success', text: 'Todos los cambios guardados correctamente' })
      setTimeout(() => setGlobalMsg(null), 4000)
      await fetchCommissions()
    } catch (err) {
      setGlobalMsg({ type: 'error', text: err.message || 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse" />
      ))}
    </div>
  )

  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={fetchCommissions}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
        Reintentar
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Comisiones por operador</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Define el % que gana el vendedor por cada venta
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium
                     rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar todos los cambios'}
        </button>
      </div>

      {globalMsg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium
          ${globalMsg.type === 'success'
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'}`}>
          {globalMsg.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Operador
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                % Comisión
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {operators.map(op => (
              <CommissionRow key={op.id} operator={op} onSave={handleSaveOne} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Los cambios de comisión no afectan retroactivamente a ventas ya registradas.
        El monto se calcula en el momento del registro.
      </p>
    </div>
  )
}
