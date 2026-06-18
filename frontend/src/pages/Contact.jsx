import { useState } from 'react'
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import ContactForm from '../components/forms/ContactForm'

function OperatorLogo({ slug, name, color }) {
  const [failed, setFailed] = useState(false)
  if (!slug || failed) {
    return (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center
                      text-lg font-extrabold flex-shrink-0"
           style={{ backgroundColor: `${color}18`, color }}>
        {name?.charAt(0) ?? '?'}
      </div>
    )
  }
  return (
    <img
      src={`/logos/${slug}.png`}
      alt={name}
      className="w-12 h-12 object-contain flex-shrink-0"
      onError={() => setFailed(true)}
    />
  )
}

export default function Contact() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const state          = useLocation().state ?? {}

  const planId     = parseInt(searchParams.get('plan'), 10)     || null
  const operatorId = parseInt(searchParams.get('operator'), 10) || null

  const planName     = state.planName     ?? null
  const operatorName = state.operatorName ?? null
  const operatorSlug = state.operatorSlug ?? ''
  const price        = state.price        ?? null
  const speed        = state.speed_mbps   ?? null
  const brandColor   = state.brandColor   ?? '#2563EB'

  const color = brandColor

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800
                       text-sm font-medium transition-colors min-h-[44px]"
          >
            ← Volver a los planes
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Plan seleccionado */}
        {(planName || planId) && (
          <div className="mb-8 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Plan seleccionado
            </p>
            <div className="flex items-center gap-4">
              <OperatorLogo slug={operatorSlug} name={operatorName} color={color} />
              <div className="flex-1 min-w-0">
                {operatorName && (
                  <p className="text-sm font-bold" style={{ color }}>{operatorName}</p>
                )}
                <p className="text-lg font-bold text-gray-900 leading-tight">
                  {planName ?? `Plan #${planId}`}
                </p>
                {speed && (
                  <p className="text-sm text-gray-500">⚡ {speed} Mbps</p>
                )}
              </div>
              {price && (
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-extrabold" style={{ color }}>
                    S/{Number(price).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">/mes</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            Solo necesitamos 2 datos
          </h1>
          <p className="text-lg text-gray-500">
            Un asesor real te llama gratis
          </p>
        </div>

        <ContactForm
          planId={planId}
          operatorId={operatorId}
          planName={planName}
          operatorName={operatorName}
          operatorSlug={operatorSlug}
          price={price}
          speed={speed}
          brandColor={brandColor}
        />
      </div>
    </div>
  )
}
