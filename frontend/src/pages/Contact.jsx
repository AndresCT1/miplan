import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import ContactForm from '../components/forms/ContactForm'

export default function Contact() {
  const [searchParams] = useSearchParams()
  const location       = useNavigate()
  const navigate       = useNavigate()
  const state          = useLocation().state ?? {}

  const planId     = parseInt(searchParams.get('plan'), 10)     || null
  const operatorId = parseInt(searchParams.get('operator'), 10) || null

  const planName     = state.planName     ?? null
  const operatorName = state.operatorName ?? null
  const price        = state.price        ?? null
  const speed        = state.speed_mbps   ?? null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-800 text-sm transition-colors"
          >
            ← Volver a los planes
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Resumen del plan seleccionado */}
        {(planName || planId) && (
          <div className="mb-8 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Plan seleccionado
            </p>
            <div className="flex items-start justify-between gap-4">
              <div>
                {operatorName && (
                  <p className="text-sm text-gray-500">{operatorName}</p>
                )}
                <p className="text-xl font-bold text-gray-900">
                  {planName ?? `Plan #${planId}`}
                </p>
                {speed && (
                  <p className="text-sm text-gray-500">{speed} Mbps</p>
                )}
              </div>
              {price && (
                <div className="text-right shrink-0">
                  <p className="text-2xl font-extrabold text-blue-600">
                    S/{Number(price).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">/mes</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Un asesor te contactará
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Completa tus datos y te llamamos para confirmar la instalación.
        </p>

        <ContactForm
          planId={planId}
          operatorId={operatorId}
          planName={planName}
          operatorName={operatorName}
          price={price}
        />
      </div>
    </div>
  )
}
