import { useNavigate } from 'react-router-dom'

export default function PlanCard({
  plan,
  operatorName = '',
  operatorId   = null,
  brandColor   = null,
  mostPopular  = false,
  ctaLabel     = null,
  highlighted  = false,   // plan destacado en página de operador
}) {
  const navigate = useNavigate()
  const { id, name, speed_mbps, price, features = [], is_featured } = plan
  const color = brandColor || '#2563EB'

  const handleSelect = () => {
    const params = new URLSearchParams({ plan: id })
    if (operatorId) params.set('operator', operatorId)
    navigate(`/contacto?${params}`, {
      state: { planName: name, operatorName, price, speed_mbps },
    })
  }

  const buttonText = ctaLabel || 'Quiero este plan'
  const showFeaturedBadge = mostPopular || (is_featured && !brandColor)

  // Estilos de borde y sombra según modo
  const cardBorder = highlighted
    ? { borderColor: color, borderWidth: '2px', borderStyle: 'solid' }
    : showFeaturedBadge
      ? { borderColor: color }
      : {}

  const cardClass = highlighted
    ? 'shadow-xl'
    : showFeaturedBadge
      ? 'shadow-md border-2'
      : 'shadow-sm border border-gray-100'

  return (
    <article
      aria-label={`Plan ${name}, S/${Number(price).toFixed(2)} al mes`}
      className={`relative rounded-2xl bg-white flex flex-col gap-4 overflow-hidden
        transition-all duration-150 hover:shadow-xl ${cardClass}`}
      style={cardBorder}
    >
      {/* Badge destacado / más popular */}
      {mostPopular && (
        <div className="text-center text-white text-sm font-bold py-2"
             style={{ backgroundColor: color }}>
          ⭐ Más popular
        </div>
      )}
      {!mostPopular && is_featured && !brandColor && (
        <div className="text-center text-white text-xs font-bold py-1.5"
             style={{ backgroundColor: color }}>
          Recomendado
        </div>
      )}

      <div className="px-6 pb-6 flex flex-col gap-4"
           style={{ paddingTop: showFeaturedBadge ? '1rem' : '1.5rem' }}>

        {/* Badge de operador — solo en sección destacados de Home */}
        {brandColor && operatorName && !mostPopular && (
          <span className="self-start text-xs font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: `${color}18`, color }}>
            {operatorName}
          </span>
        )}

        {/* 1. PRECIO — protagonista absoluto */}
        <div className="text-center">
          <div className="flex items-start justify-center gap-1">
            <span className="text-xl font-bold mt-2" style={{ color }}>S/</span>
            <span className="text-5xl font-extrabold leading-none" style={{ color }}>
              {Number(price).toFixed(2)}
            </span>
          </div>
          <p className="text-base text-gray-400 mt-1">al mes</p>
        </div>

        {/* 2. VELOCIDAD — segundo elemento en importancia */}
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl"
             style={{ backgroundColor: `${color}12` }}>
          <span className="text-2xl" aria-hidden="true">⚡</span>
          <span className="text-3xl font-extrabold" style={{ color }}>
            {speed_mbps}
          </span>
          <span className="text-lg font-semibold text-gray-500">Mbps</span>
        </div>
        <p className="text-sm text-center text-gray-400 -mt-2">
          velocidad de internet
        </p>

        {/* 3. NOMBRE DEL PLAN */}
        <h3 className="text-lg font-semibold text-gray-700 text-center leading-tight">
          {name}
        </h3>

        {/* 4. FEATURES — iconos + texto mínimo text-base */}
        <ul className="flex flex-col gap-2.5 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-base text-gray-600">
              <span className="text-green-500 font-bold text-lg mt-0.5 shrink-0"
                    aria-hidden="true">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* 5. CTA — ancho completo, 56px mínimo */}
        <button
          onClick={handleSelect}
          className="w-full rounded-xl text-white font-bold text-lg
                     min-h-[56px] transition-opacity duration-150 hover:opacity-90
                     active:scale-95"
          style={{ backgroundColor: color }}
        >
          {buttonText}
        </button>
      </div>
    </article>
  )
}
