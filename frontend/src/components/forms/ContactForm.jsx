import { useState } from 'react'
import { leadsService } from '../../services/api'

const INITIAL = { dni: '', name: '', address: '', phone: '' }

function FieldError({ msg }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-500">{msg}</p>
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function validate(fields) {
  const errors = {}
  if (!/^\d{8}$/.test(fields.dni))        errors.dni     = 'DNI debe tener exactamente 8 dígitos'
  if (fields.name.trim().length < 3)       errors.name    = 'Nombre muy corto (mínimo 3 caracteres)'
  if (fields.address.trim().length < 10)   errors.address = 'Dirección muy corta (mínimo 10 caracteres)'
  if (!/^9\d{8}$/.test(fields.phone))     errors.phone   = 'Celular debe empezar con 9 y tener 9 dígitos'
  return errors
}

export default function ContactForm({ planId, operatorId, planName, operatorName, price }) {
  const [fields, setFields]   = useState(INITIAL)
  const [touched, setTouched] = useState({})
  const [status, setStatus]   = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const errors    = validate(fields)
  const hasErrors = Object.keys(errors).length > 0

  const handleChange = (e) => {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Marcar todos los campos como tocados para mostrar errores
    setTouched({ dni: true, name: true, address: true, phone: true })
    if (hasErrors) return

    setStatus('loading')
    setErrorMsg('')

    try {
      await leadsService.create({
        ...fields,
        name:    fields.name.trim(),
        address: fields.address.trim(),
        operatorId,
        planId,
      })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Ocurrió un error. Intenta de nuevo.')
    }
  }

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Solicitud enviada!
        </h2>
        <p className="text-gray-500 max-w-sm mx-auto">
          Un asesor de <strong>{operatorName || 'nuestro equipo'}</strong> se
          comunicará contigo pronto al número <strong>{fields.phone}</strong>.
        </p>
        {planName && (
          <p className="mt-3 text-sm text-gray-400">
            Plan solicitado: <strong>{planName}</strong>
            {price && ` — S/${Number(price).toFixed(2)}/mes`}
          </p>
        )}
      </div>
    )
  }

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-gray-900 text-sm
     outline-none transition-colors duration-150
     focus:ring-2 focus:ring-blue-500 focus:border-transparent
     ${touched[field] && errors[field]
       ? 'border-red-400 bg-red-50'
       : 'border-gray-200 bg-white hover:border-gray-300'}`

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

      {/* DNI */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          DNI <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="dni"
          value={fields.dni}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={8}
          inputMode="numeric"
          placeholder="12345678"
          className={inputClass('dni')}
          aria-describedby="dni-error"
        />
        <FieldError msg={touched.dni && errors.dni} />
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={fields.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Juan Pérez García"
          className={inputClass('name')}
        />
        <FieldError msg={touched.name && errors.name} />
      </div>

      {/* Dirección */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="address"
          value={fields.address}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Av. Ejercito 123, Arequipa"
          className={inputClass('address')}
        />
        <FieldError msg={touched.address && errors.address} />
      </div>

      {/* Celular */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Celular <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={fields.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={9}
          inputMode="numeric"
          placeholder="987654321"
          className={inputClass('phone')}
        />
        <FieldError msg={touched.phone && errors.phone} />
      </div>

      {/* Error de envío */}
      {status === 'error' && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      {/* Botón */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700
                   disabled:opacity-60 disabled:cursor-not-allowed
                   text-white font-semibold text-base
                   flex items-center justify-center gap-2
                   transition-colors duration-150"
      >
        {status === 'loading' ? (
          <><Spinner /> Enviando...</>
        ) : (
          'Quiero que me contacten'
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Tus datos son confidenciales y solo se usarán para contactarte.
      </p>
    </form>
  )
}
