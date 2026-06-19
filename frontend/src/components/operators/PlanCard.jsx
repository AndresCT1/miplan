import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCompare }         from '../../context/CompareContext'
import { usePriceCountUp }    from '../../hooks/usePriceCountUp'
import { useScrollReveal }    from '../../hooks/useScrollReveal'

// Tooltip solo en la primera tarjeta que se renderiza por sesión
let _tooltipClaimed = false

export default function PlanCard({
  plan,
  operatorName = '',
  operatorId   = null,
  operatorSlug = '',
  brandColor   = null,
  mostPopular  = false,
  ctaLabel     = null,
  highlighted  = false,
  onSelect     = null,   // override de navegación cuando viene del contexto de home
}) {
  const navigate = useNavigate()
  const { addPlan, removePlan, isPlanSelected, selectedPlans } = useCompare()

  const { id, name, speed_mbps, price, features = [], is_featured } = plan
  const color = brandColor || '#2563EB'

  const isSelected = isPlanSelected(id)
  const maxReached = selectedPlans.length >= 3 && !isSelected

  // Tooltip: solo primera tarjeta visible, solo una vez por sesión
  const [showTooltip, setShowTooltip] = useState(() => {
    if (_tooltipClaimed) return false
    if (sessionStorage.getItem('miplan_compare_tip_shown')) return false
    _tooltipClaimed = true
    sessionStorage.setItem('miplan_compare_tip_shown', '1')
    return true
  })

  useEffect(() => {
    if (!showTooltip) return
    const t = setTimeout(() => setShowTooltip(false), 3000)
    return () => clearTimeout(t)
  }, [showTooltip])

  const handleSelect = () => {
    if (onSelect) { onSelect(); return }
    const params = new URLSearchParams({ plan: id })
    if (operatorId) params.set('operator', operatorId)
    navigate(`/contacto?${params}`, {
      state: { planName: name, operatorName, operatorSlug, price, speed_mbps, brandColor: color },
    })
  }

  const handleShare = (e) => {
    e.stopPropagation()
    const shareText = encodeURIComponent(
      `📡 Mira este plan de ${operatorName}:\n\n` +
      `💼 ${name}\n` +
      `⚡ ${speed_mbps} Mbps\n` +
      `💰 S/${Number(price).toFixed(2)}/mes\n\n` +
      `Compáralo en MiPlan.pe:\n` +
      `https://miplan-chi.vercel.app/operador/${operatorSlug}`
    )
    window.open(`https://wa.me/?text=${shareText}`, '_blank', 'noopener,noreferrer')
  }

  const handleCompareToggle = () => {
    if (isSelected) {
      removePlan(id)
    } else {
      addPlan({ id, name, price, speed_mbps, operatorName, operatorSlug, brandColor: color, operatorId })
    }
    setShowTooltip(false)
  }

  const buttonText        = ctaLabel || 'Quiero este plan'
  const showFeaturedBadge = mostPopular || (is_featured && !brandColor)
  const { ref: cardRevealRef, visible: cardVisible } = useScrollReveal()
  const { value: displayPrice, start: startCountUp } = usePriceCountUp(Number(price))

  // Inicia count-up cuando la card entra en viewport
  useEffect(() => { if (cardVisible) startCountUp() }, [cardVisible])

  const cardBorder = isSelected
    ? { borderColor: '#2563EB', borderWidth: '2px', borderStyle: 'dashed' }
    : highlighted
      ? { borderColor: color, borderWidth: '2px', borderStyle: 'solid' }
      : showFeaturedBadge
        ? { borderColor: color }
        : {}

  const cardClass = isSelected
    ? 'shadow-md border-2'
    : highlighted
      ? 'shadow-xl'
      : showFeaturedBadge
        ? 'shadow-md border-2'
        : 'shadow-sm border border-gray-100'

  return (
    <article
      ref={cardRevealRef}
      aria-label={`Plan ${name}, S/${Number(price).toFixed(2)} al mes`}
      className={`relative rounded-2xl bg-white flex flex-col gap-4 overflow-hidden
        transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${cardClass}
        ${cardVisible ? 'animate-fade-up' : 'opacity-0'}`}
      style={cardBorder}
    >
      {/* Botón compartir — esquina superior derecha */}
      <div className="group/share absolute top-2 right-2 z-20">
        <button
          onClick={handleShare}
          aria-label="Compartir este plan por WhatsApp"
          className="w-8 h-8 rounded-full bg-white/90 shadow-sm border border-gray-200
                     flex items-center justify-center text-gray-500
                     hover:bg-green-50 hover:text-green-600 hover:border-green-200
                     transition-all duration-150"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M11.97 0C5.373 0 0 5.373 0 11.97c0 2.096.546 4.066 1.5 5.775L0 24l6.435-1.687A11.928 11.928 0 0011.97 24c6.598 0 11.97-5.373 11.97-11.97C23.94 5.373 18.567 0 11.97 0zm0 21.818a9.818 9.818 0 01-5.007-1.371l-.359-.214-3.72.975.994-3.624-.234-.372A9.818 9.818 0 012.152 11.97C2.152 6.582 6.582 2.152 11.97 2.152c5.389 0 9.818 4.43 9.818 9.818 0 5.389-4.43 9.848-9.818 9.848z"/>
          </svg>
        </button>
        {/* Tooltip */}
        <span className="absolute top-full right-0 mt-1.5 px-2 py-1 rounded-lg
                         bg-gray-900 text-white text-[10px] font-medium whitespace-nowrap
                         opacity-0 group-hover/share:opacity-100 transition-opacity duration-150
                         pointer-events-none">
          Compartir por WhatsApp
        </span>
      </div>

      {mostPopular && (
        <div className="text-center text-white text-sm font-bold py-2 relative overflow-hidden"
             style={{ backgroundColor: color }}>
          ⭐ Más popular
          {/* Shimmer */}
          <span className="absolute inset-0 animate-shimmer"
                style={{
                  background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.3) 50%,transparent 100%)',
                  backgroundSize: '200% auto',
                }}
                aria-hidden="true" />
        </div>
      )}
      {!mostPopular && is_featured && !brandColor && (
        <div className="text-center text-white text-xs font-bold py-1.5 relative overflow-hidden"
             style={{ backgroundColor: color }}>
          Recomendado
          <span className="absolute inset-0 animate-shimmer"
                style={{
                  background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.3) 50%,transparent 100%)',
                  backgroundSize: '200% auto',
                }}
                aria-hidden="true" />
        </div>
      )}

      <div className="px-6 pb-6 flex flex-col gap-4"
           style={{ paddingTop: showFeaturedBadge ? '1rem' : '1.5rem' }}>

        {brandColor && operatorName && !mostPopular && (
          <span className="self-start text-xs font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: `${color}18`, color }}>
            {operatorName}
          </span>
        )}

        {/* 1. PRECIO */}
        <div className="text-center">
          <div className="flex items-start justify-center gap-1">
            <span className="text-xl font-bold mt-2" style={{ color }}>S/</span>
            <span className="text-5xl font-extrabold leading-none tabular-nums" style={{ color }}>
              {displayPrice.toFixed(2)}
            </span>
          </div>
          <p className="text-base text-gray-400 mt-1">al mes</p>
        </div>

        {/* 2. VELOCIDAD */}
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl"
             style={{ backgroundColor: `${color}12` }}>
          <span className="text-2xl" aria-hidden="true">⚡</span>
          <span className="text-3xl font-extrabold" style={{ color }}>{speed_mbps}</span>
          <span className="text-lg font-semibold text-gray-500">Mbps</span>
        </div>
        <p className="text-sm text-center text-gray-400 -mt-2">velocidad de internet</p>

        {/* 3. NOMBRE */}
        <h3 className="text-lg font-semibold text-gray-700 text-center leading-tight">
          {name}
        </h3>

        {/* 4. FEATURES */}
        <ul className="flex flex-col gap-2.5 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-base text-gray-600">
              <span className="text-green-500 font-bold text-lg mt-0.5 shrink-0"
                    aria-hidden="true">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* 5. CTA principal */}
        <button
          onClick={handleSelect}
          className="w-full rounded-xl text-white font-bold text-lg
                     min-h-[56px] transition-opacity duration-150 hover:opacity-90
                     active:scale-95"
          style={{ backgroundColor: color }}
        >
          {buttonText}
        </button>

        {/* 6. Botón comparar con tooltip */}
        <div className="relative">
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-20
                            bg-blue-600 text-white text-sm font-semibold px-4 py-2.5
                            rounded-xl shadow-lg whitespace-nowrap
                            animate-bounce pointer-events-none">
              ¡Toca aquí para comparar con otros planes!
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-0
                               border-l-[6px] border-r-[6px] border-t-[6px]
                               border-l-transparent border-r-transparent border-t-blue-600" />
            </div>
          )}

          <button
            onClick={handleCompareToggle}
            disabled={maxReached}
            title={maxReached ? 'Máximo 3 planes a la vez' : ''}
            aria-label={isSelected ? 'Quitar de comparación' : 'Agregar a comparación'}
            className={`w-full rounded-xl font-semibold min-h-[48px]
                        transition-all duration-150 flex items-center justify-center gap-2
                        ${isSelected
                          ? 'bg-blue-50 text-blue-700 border-2 border-blue-400 border-dashed'
                          : maxReached
                            ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                            : 'bg-white text-blue-600 border-2 border-blue-300 border-dashed hover:bg-blue-50'
                        }`}
          >
            {isSelected ? (
              <>
                <span aria-hidden="true">✓</span>
                <span>En comparación</span>
              </>
            ) : maxReached ? (
              <>
                <span aria-hidden="true">⚖️</span>
                <span>Máximo 3 planes</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">⚖️</span>
                <span>Comparar este plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
