import { useNavigate } from 'react-router-dom'

export default function PlanCard({
  plan,
  operatorName = '',
  operatorId   = null,
  brandColor   = null,
  mostPopular  = false,
}) {
  const navigate = useNavigate()
  const { id, name, speed_mbps, price, features = [], is_featured } = plan

  const handleSelect = () => {
    const params = new URLSearchParams({ plan: id })
    if (operatorId) params.set('operator', operatorId)
    navigate(`/contacto?${params}`, {
      state: { planName: name, operatorName, price, speed_mbps },
    })
  }

  const showRing = mostPopular || is_featured

  return (
    <div className={`relative rounded-2xl bg-white shadow-sm border p-6 flex flex-col gap-4
      transition-all duration-150 hover:shadow-lg
      ${showRing ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100'}`}>

      {/* Badges */}
      {mostPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap
          bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
          ⭐ Más popular
        </span>
      )}
      {!mostPopular && is_featured && !brandColor && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2
          bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          Destacado
        </span>
      )}

      {/* Operator badge (home featured section) */}
      {brandColor && operatorName && (
        <span className="self-start text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${brandColor}18`, color: brandColor }}>
          {operatorName}
        </span>
      )}

      <div>
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        {operatorName && !brandColor && (
          <p className="text-sm text-gray-400">{operatorName}</p>
        )}
      </div>

      <div className="flex items-end gap-1">
        <span className="text-4xl font-extrabold text-gray-900">
          S/{Number(price).toFixed(2)}
        </span>
        <span className="text-gray-400 mb-1">/mes</span>
      </div>

      <div className="flex items-center gap-2 font-semibold"
           style={{ color: brandColor || '#2563EB' }}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {speed_mbps} Mbps
      </div>

      <ul className="flex flex-col gap-2 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={handleSelect}
        className="mt-2 w-full py-3 rounded-xl text-white font-semibold
                   transition-all duration-150 hover:opacity-90 min-h-[48px]"
        style={{ backgroundColor: brandColor || '#2563EB' }}
      >
        {brandColor ? `Ver planes de ${operatorName}` : 'Quiero este plan'}
      </button>
    </div>
  )
}
