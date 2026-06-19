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
