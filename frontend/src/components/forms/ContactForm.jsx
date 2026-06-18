import { useState, useEffect, useRef } from 'react'
import { leadsService } from '../../services/api'

const WA_BASE = 'https://wa.me/51920170692'
const WA_MSG  = encodeURIComponent('Hola, vi MiPlan.pe y quiero información sobre planes de internet')
const WA_URL  = `${WA_BASE}?text=${WA_MSG}`

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function CheckAnim() {
  return (
    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center
                    animate-bounce mx-auto">
      <span className="text-5xl" role="img" aria-label="Éxito">✅</span>
    </div>
  )
}

function SuccessScreen({ name, phone, planName, price, brandColor, operatorSlug, operatorName }) {
  const color     = brandColor || '#2563EB'
  const firstName = name.trim().split(' ')[0]
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-2 text-center">
      <CheckAnim />

      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          ¡Listo, {firstName}!
        </h2>
        <p className="text-lg text-gray-600 mt-2">
          Te llamamos al{' '}
          <span className="font-extrabold text-gray-900">{phone}</span>
          {' '}en menos de 2 horas
        </p>
      </div>

      {planName && (
        <div className="w-full max-w-sm bg-gray-50 rounded-2xl px-5 py-4 text-left
                        border border-gray-100">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2">
            Plan seleccionado
          </p>
          <div className="flex items-center gap-3">
            {operatorSlug && !logoFailed ? (
              <img
                src={`/logos/${operatorSlug}.png`}
                alt={operatorName}
                className="w-10 h-10 object-contain flex-shrink-0"
                onError={() => setLogoFailed(true)}
              />
            ) : operatorName ? (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center
                              text-sm font-extrabold flex-shrink-0"
                   style={{ backgroundColor: `${color}18`, color }}>
                {operatorName.charAt(0)}
              </div>
            ) : null}
            <div>
              {operatorName && (
                <p className="text-xs font-bold" style={{ color }}>{operatorName}</p>
              )}
              <p className="text-base font-bold text-gray-800">{planName}</p>
              {price && (
                <p className="text-xl font-extrabold" style={{ color }}>
                  S/{Number(price).toFixed(2)}/mes
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <a
        href={`${WA_BASE}?text=${encodeURIComponent(
          `Hola, acabo de solicitar información en MiPlan.pe. Mi nombre es ${name} y mi celular es ${phone}.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full max-w-sm py-4 bg-green-500 hover:bg-green-600 text-white
                   font-bold rounded-xl text-base min-h-[56px]
                   flex items-center justify-center gap-2
                   transition-colors shadow-md shadow-green-200 active:scale-95"
      >
        💬 WhatsApp por si necesitas algo antes
      </a>
    </div>
  )
}

export default function ContactForm({
  planId       = null,
  operatorId   = null,
  planName     = null,
  operatorName = null,
  operatorSlug = '',
  price        = null,
  speed        = null,
  brandColor   = '#2563EB',
}) {
  const color = brandColor

  const [fields, setFields]   = useState({ phone: '', name: '' })
  const [touched, setTouched] = useState({})
  const [status, setStatus]   = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const phoneRef = useRef(null)

  useEffect(() => { phoneRef.current?.focus() }, [])

  const errors = {
    phone: !/^9\d{8}$/.test(fields.phone)
      ? 'Debe empezar con 9 y tener 9 dígitos'
      : null,
    name: fields.name.trim().length < 3
      ? 'Mínimo 3 caracteres'
      : null,
  }
  const hasErrors = Object.values(errors).some(Boolean)

  const handleChange = (field) => (e) =>
    setFields((p) => ({ ...p, [field]: e.target.value }))

  const handleBlur = (field) => () =>
    setTouched((p) => ({ ...p, [field]: true }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ phone: true, name: true })
    if (hasErrors) return

    setStatus('loading')
    setErrorMsg('')
    try {
      await leadsService.create({
        phone:      fields.phone,
        name:       fields.name.trim(),
        operatorId: operatorId || undefined,
        planId:     planId     || undefined,
      })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Ocurrió un error. Intenta de nuevo.')
    }
  }

  if (status === 'success') {
    return (
      <SuccessScreen
        name={fields.name}
        phone={fields.phone}
        planName={planName}
        price={price}
        brandColor={color}
        operatorSlug={operatorSlug}
        operatorName={operatorName}
      />
    )
  }

  const inputClass = (field) =>
    `w-full px-5 py-4 rounded-xl border-2 text-gray-900 text-xl
     outline-none transition-colors
     focus:ring-2 focus:ring-offset-0 focus:border-transparent
     ${touched[field] && errors[field]
       ? 'border-red-400 bg-red-50 focus:ring-red-300'
       : 'border-gray-200 hover:border-gray-300 focus:ring-blue-400'}`

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

      {/* Campo 1 — Celular */}
      <div>
        <label htmlFor="phone"
               className="block text-lg font-semibold text-gray-800 mb-2">
          ¿A qué número te llamamos?
        </label>
        <input
          ref={phoneRef}
          id="phone"
          type="tel"
          value={fields.phone}
          onChange={handleChange('phone')}
          onBlur={handleBlur('phone')}
          maxLength={9}
          inputMode="numeric"
          placeholder="9XX XXX XXX"
          className={inputClass('phone')}
          aria-describedby="phone-error"
        />
        {touched.phone && errors.phone && (
          <p id="phone-error" className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
            <span aria-hidden="true">⚠️</span> {errors.phone}
          </p>
        )}
      </div>

      {/* Campo 2 — Nombre */}
      <div>
        <label htmlFor="name"
               className="block text-lg font-semibold text-gray-800 mb-2">
          ¿Cuál es tu nombre?
        </label>
        <input
          id="name"
          type="text"
          value={fields.name}
          onChange={handleChange('name')}
          onBlur={handleBlur('name')}
          placeholder="Juan Pérez"
          className={inputClass('name')}
          aria-describedby="name-error"
        />
        {touched.name && errors.name && (
          <p id="name-error" className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
            <span aria-hidden="true">⚠️</span> {errors.name}
          </p>
        )}
      </div>

      {/* Error de envío */}
      {status === 'error' && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* CTA */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 rounded-xl text-white font-bold text-lg
                   min-h-[56px] transition-all
                   flex items-center justify-center gap-2
                   disabled:opacity-60 disabled:cursor-not-allowed
                   hover:opacity-90 active:scale-95"
        style={{ backgroundColor: color }}
      >
        {status === 'loading' ? (
          <><Spinner /> Enviando...</>
        ) : (
          'Quiero que me contacten 📞'
        )}
      </button>

      {/* Alternativa WhatsApp */}
      <p className="text-center text-sm text-gray-400">
        ¿Prefieres escribirnos ahora?{' '}
        <a
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 font-semibold underline underline-offset-2"
        >
          WhatsApp 920 170 692
        </a>
      </p>
    </form>
  )
}
