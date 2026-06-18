import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { plansService } from '../services/api'
import { useCompare }   from '../context/CompareContext'

function LogoWithFallback({ slug, name, color }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-extrabold"
           style={{ backgroundColor: `${color}18`, color }}>
        {name.charAt(0)}
      </div>
    )
  }
  return (
    <img
      src={`/logos/${slug}.png`}
      alt={`Logo ${name}`}
      className="w-16 h-16 object-contain"
      onError={() => setFailed(true)}
    />
  )
}

function Skeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="h-8 bg-gray-100 rounded-xl animate-pulse mb-8 w-64" />
      <div className="overflow-x-auto">
        <div className="min-w-[480px] grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-96" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Compare() {
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const { clearPlans }  = useCompare()

  const [plans,   setPlans]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const idsParam = searchParams.get('ids') || ''

  useEffect(() => {
    document.title = 'Comparar Planes | MiPlan.pe'
  }, [])

  useEffect(() => {
    const ids = idsParam
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isInteger(n) && n > 0)

    if (ids.length < 2) {
      setError('Selecciona al menos 2 planes para comparar.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    plansService.compare(ids)
      .then(setPlans)
      .catch((err) => setError(err.message || 'Error al cargar los planes.'))
      .finally(() => setLoading(false))
  }, [idsParam])

  if (loading) return <Skeleton />

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 gap-6">
        <p className="text-gray-500 text-lg text-center">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold min-h-[52px]"
        >
          ← Volver a elegir planes
        </button>
      </div>
    )
  }

  const prices = plans.map((p) => Number(p.price))
  const speeds  = plans.map((p) => p.speed_mbps)
  const minPrice = Math.min(...prices)
  const maxSpeed = Math.max(...speeds)

  // Unión de todas las features únicas
  const allFeatures = [...new Set(plans.flatMap((p) => p.features || []))]

  const handleWantPlan = (plan) => {
    const params = new URLSearchParams({ plan: plan.id, operator: plan.operator_id })
    navigate(`/contacto?${params}`, {
      state: {
        planName:     plan.name,
        operatorName: plan.operator_name,
        price:        plan.price,
        speed_mbps:   plan.speed_mbps,
      },
    })
  }

  const handleClear = () => {
    clearPlans()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900
                         text-sm font-medium border border-gray-200 rounded-xl
                         px-3 py-2.5 transition-colors min-h-[44px]"
            >
              ← Volver a comparar más
            </button>
            <Link to="/" className="hidden sm:block text-blue-600 font-extrabold text-lg">
              MiPlan<span className="text-gray-900">.pe</span>
            </Link>
          </div>
          <button
            onClick={handleClear}
            className="text-sm font-medium text-gray-400 hover:text-red-500
                       transition-colors underline underline-offset-2"
          >
            Limpiar comparación
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
          Comparando {plans.length} planes
        </h1>
        <p className="text-gray-500 text-base mb-8">
          Revisa cada detalle y elige el que mejor se adapta a tu hogar.
        </p>

        {/* Tabla — scroll horizontal en mobile */}
        <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-100">
          <table className="w-full min-w-[480px] bg-white">

            {/* Cabecera con logos */}
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-5 pl-6 pr-4 text-left text-sm font-medium text-gray-400 w-[140px]">
                  Plan
                </th>
                {plans.map((plan) => (
                  <th key={plan.id} className="py-5 px-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <LogoWithFallback
                        slug={plan.operator_slug}
                        name={plan.operator_name}
                        color={plan.brand_color}
                      />
                      <span className="text-sm font-extrabold"
                            style={{ color: plan.brand_color }}>
                        {plan.operator_name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Nombre del plan */}
              <tr className="border-b border-gray-50 bg-gray-50/40">
                <td className="py-4 pl-6 pr-4 text-base font-medium text-gray-500">
                  Nombre del plan
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-4 px-4 text-center text-base font-semibold text-gray-800">
                    {plan.name}
                  </td>
                ))}
              </tr>

              {/* Precio */}
              <tr className="border-b border-gray-50">
                <td className="py-5 pl-6 pr-4 text-base font-medium text-gray-500">
                  Precio mensual
                </td>
                {plans.map((plan) => {
                  const isCheapest = Number(plan.price) === minPrice
                  return (
                    <td key={plan.id} className="py-5 px-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-start justify-center gap-0.5">
                          <span className="text-base font-bold mt-1.5"
                                style={{ color: plan.brand_color }}>S/</span>
                          <span className="text-4xl font-extrabold leading-none"
                                style={{ color: plan.brand_color }}>
                            {Number(plan.price).toFixed(2)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">al mes</span>
                        {isCheapest && (
                          <span className="bg-green-100 text-green-700 text-xs font-bold
                                           px-2.5 py-1 rounded-full">
                            💰 Más económico
                          </span>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>

              {/* Velocidad */}
              <tr className="border-b border-gray-50 bg-gray-50/40">
                <td className="py-5 pl-6 pr-4 text-base font-medium text-gray-500">
                  Velocidad
                </td>
                {plans.map((plan) => {
                  const isFastest = plan.speed_mbps === maxSpeed
                  return (
                    <td key={plan.id} className="py-5 px-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-end justify-center gap-1">
                          <span className="text-3xl font-extrabold text-gray-800">
                            {plan.speed_mbps}
                          </span>
                          <span className="text-lg font-semibold text-gray-400 mb-0.5">Mbps</span>
                        </div>
                        {isFastest && (
                          <span className="bg-blue-100 text-blue-700 text-xs font-bold
                                           px-2.5 py-1 rounded-full">
                            ⚡ Más rápido
                          </span>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>

              {/* Features */}
              {allFeatures.map((feature, idx) => (
                <tr key={feature}
                    className={`border-b border-gray-50 ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                  <td className="py-4 pl-6 pr-4 text-base text-gray-600">
                    {feature}
                  </td>
                  {plans.map((plan) => {
                    const has = (plan.features || []).includes(feature)
                    return (
                      <td key={plan.id} className="py-4 px-4 text-center text-xl">
                        {has
                          ? <span className="text-green-500 font-bold" aria-label="Incluido">✓</span>
                          : <span className="text-gray-300" aria-label="No incluido">—</span>
                        }
                      </td>
                    )
                  })}
                </tr>
              ))}

              {/* CTA row */}
              <tr>
                <td className="py-5 pl-6 pr-4" />
                {plans.map((plan) => (
                  <td key={plan.id} className="py-5 px-4">
                    <button
                      onClick={() => handleWantPlan(plan)}
                      className="w-full py-4 rounded-xl text-white font-bold text-base
                                 min-h-[56px] transition-opacity hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: plan.brand_color }}
                    >
                      Quiero este plan
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          Precios referenciales sujetos a disponibilidad en tu zona.
          Un asesor confirmará el precio final antes de la instalación.
        </p>

        {/* Sección fallback — asesor humano */}
        <div className="mt-12 rounded-2xl bg-blue-50 px-6 py-8 text-center">
          <p className="text-2xl font-bold text-gray-900 mb-2">
            ¿Ninguno te convenció?
          </p>
          <p className="text-base text-gray-500 mb-6 max-w-md mx-auto">
            Un asesor real te ayuda a elegir el plan ideal según tu zona,
            presupuesto y cuántas personas usan el internet en tu hogar.
            Sin costo y sin compromiso.
          </p>
          <button
            onClick={() => navigate('/contacto')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600
                       hover:bg-blue-700 text-white font-bold rounded-xl
                       text-base min-h-[56px] transition-colors shadow-md shadow-blue-200
                       active:scale-95"
          >
            Hablar con un asesor →
          </button>
          <p className="text-sm text-gray-400 mt-4">
            Te llamamos hoy · Lunes a sábado de 9am a 7pm
          </p>
        </div>
      </main>
    </div>
  )
}
