import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCompare }      from '../../context/CompareContext'
import { usePriceCountUp } from '../../hooks/usePriceCountUp'
import { useScrollReveal } from '../../hooks/useScrollReveal'

// ── Parseo de features estructuradas ──────────────────────────────────────────
function parsePlanFeatures(features) {
  const find = (prefix) => {
    const f = features.find(x => x.startsWith(prefix))
    return f ? f.slice(prefix.length).trim() : null
  }
  return {
    precioPromo:      find('Precio promo: '),
    precioRegular:    find('Precio regular: '),
    velocidadPromo:   find('Velocidad promo: '),
    velocidadRegular: find('Velocidad regular: '),
    categoria:        find('categoria:'),
    extras: features.filter(f =>
      !f.startsWith('Precio promo:') &&
      !f.startsWith('Precio regular:') &&
      !f.startsWith('Velocidad promo:') &&
      !f.startsWith('Velocidad regular:') &&
      !f.startsWith('categoria:')
    ),
  }
}

function extractDuration(str) {
  const m = str?.match(/x(\d+)\s*mes/)
  return m ? m[1] : null
}

function extractMbps(str) {
  const m = str?.match(/^(\d+)/)
  return m ? m[1] : null
}

// Tooltip solo en la primera tarjeta que se renderiza por sesión
let _tooltipClaimed = false

// ─────────────────────────────────────────────────────────────────────────────
export default function PlanCard({
  plan,
  operatorName = '',
  operatorId   = null,
  operatorSlug = '',
  brandColor   = null,
  mostPopular  = false,
  ctaLabel     = null,
  highlighted  = false,
  onSelect     = null,
}) {
  const navigate = useNavigate()
  const { addPlan, removePlan, isPlanSelected, selectedPlans } = useCompare()

  const { id, name, speed_mbps, price, features = [], is_featured } = plan
  const color = brandColor || '#2563EB'

  const isSelected = isPlanSelected(id)
  const maxReached = selectedPlans.length >= 3 && !isSelected

  // ── Parseo ────────────────────────────────────────────────────────────────
  const parsed   = parsePlanFeatures(features)
  const hasPromo = Boolean(parsed.precioPromo && parsed.precioRegular)
  const promoDur = extractDuration(parsed.precioPromo)

  const velMbps    = extractMbps(parsed.velocidadPromo) ?? String(speed_mbps)
  const velDur     = extractDuration(parsed.velocidadPromo)
  const velHasPromo = Boolean(
    parsed.velocidadRegular &&
    parsed.velocidadPromo &&
    extractMbps(parsed.velocidadPromo) !== extractMbps(parsed.velocidadRegular)
  )

  // ── Tooltip comparar ──────────────────────────────────────────────────────
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

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelect = () => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'select_item', { item_name: name })
    }
    if (onSelect) { onSelect(); return }
    const params = new URLSearchParams({ plan: id })
    if (operatorId) params.set('operator', operatorId)
    navigate(`/contacto?${params}`, {
      state: { planName: name, operatorName, operatorSlug, price, speed_mbps, brandColor: color },
    })
  }

  const handleShare = (e) => {
    e.stopPropagation()
    const promoNote = hasPromo
      ? `\n💥 Promo: ${parsed.precioPromo}`
      : `\n💰 S/${Number(price).toFixed(2)}/mes`
    const shareText = encodeURIComponent(
      `📡 Mira este plan de ${operatorName}:\n\n` +
      `💼 ${name}\n` +
      `⚡ ${speed_mbps} Mbps${promoNote}\n\n` +
      `Compáralo en MiPlan.pe:\n` +
      `https://miplan-chi.vercel.app/operador/${operatorSlug}`
    )
    window.open(`https://wa.me/?text=${shareText}`, '_blank', 'noopener,noreferrer')
  }

  const handleCompareToggle = () => {
    if (isSelected) removePlan(id)
    else addPlan({ id, name, price, speed_mbps, operatorName, operatorSlug, brandColor: color, operatorId })
    setShowTooltip(false)
  }

  // ── Estilos de tarjeta ────────────────────────────────────────────────────
  const buttonText        = ctaLabel || 'Quiero este plan'
  const showFeaturedBadge = mostPopular || (is_featured && !brandColor)
  const { ref: cardRevealRef, visible: cardVisible } = useScrollReveal()
  const { value: displayPrice, start: startCountUp } = usePriceCountUp(Number(price))
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
      aria-label={`Plan ${name}${hasPromo ? `, promo ${parsed.precioPromo}` : `, S/${Number(price).toFixed(2)} al mes`}`}
      className={`relative rounded-2xl bg-white flex flex-col gap-4 overflow-hidden
        transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${cardClass}
        ${cardVisible ? 'animate-fade-up' : 'opacity-0'}`}
      style={cardBorder}
    >
      {/* ── Badge superior ────────────────────────────────────────────────── */}
      {mostPopular && (
        <div className="text-center text-white text-sm font-bold py-2 relative overflow-hidden"
             style={{ backgroundColor: color }}>
          ⭐ Más popular
          <span className="absolute inset-0 animate-shimmer"
                style={{ background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.3) 50%,transparent 100%)', backgroundSize: '200% auto' }}
                aria-hidden="true" />
        </div>
      )}
      {!mostPopular && is_featured && !brandColor && (
        <div className="text-center text-white text-xs font-bold py-1.5 relative overflow-hidden"
             style={{ backgroundColor: color }}>
          Recomendado
          <span className="absolute inset-0 animate-shimmer"
                style={{ background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.3) 50%,transparent 100%)', backgroundSize: '200% auto' }}
                aria-hidden="true" />
        </div>
      )}

      <div className="px-6 pb-6 flex flex-col gap-4"
           style={{ paddingTop: showFeaturedBadge ? '1rem' : '1.5rem' }}>

        {/* Etiqueta operador (listas multi-operador) */}
        {brandColor && operatorName && !mostPopular && (
          <span className="self-start text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: `${color}18`, color }}>
            {operatorName}
          </span>
        )}

        {/* ── 1. PRECIO ─────────────────────────────────────────────────── */}
        <div className="text-center">
          {hasPromo && (
            <span className="inline-flex items-center gap-1 text-xs font-bold
                             px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 mb-2">
              🏷️ PROMOCIÓN
            </span>
          )}
          <div className="flex items-start justify-center gap-1">
            <span className="text-xl font-bold mt-2" style={{ color }}>S/</span>
            <span className="text-5xl font-extrabold leading-none tabular-nums" style={{ color }}>
              {displayPrice.toFixed(2)}
            </span>
          </div>
          {hasPromo && promoDur ? (
            <p className="text-sm font-semibold mt-1" style={{ color }}>
              por {promoDur} meses
            </p>
          ) : (
            <p className="text-base text-gray-400 mt-1">al mes</p>
          )}
          {hasPromo && parsed.precioRegular && (
            <p className="text-sm text-gray-400 mt-0.5">
              Luego <span className="line-through">{parsed.precioRegular}</span>
            </p>
          )}
        </div>

        {/* ── 2. VELOCIDAD ──────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl"
               style={{ backgroundColor: `${color}12` }}>
            <span className="text-2xl" aria-hidden="true">⚡</span>
            <span className="text-3xl font-extrabold" style={{ color }}>{velMbps}</span>
            <span className="text-lg font-semibold text-gray-500">Mbps</span>
          </div>
          {velHasPromo && velDur && (
            <p className="text-xs text-center font-bold mt-1.5" style={{ color }}>
              ⚡ BONO x{velDur} meses
            </p>
          )}
          {velHasPromo && parsed.velocidadRegular && (
            <p className="text-xs text-center text-gray-400 mt-0.5">
              Luego {parsed.velocidadRegular}
            </p>
          )}
          {!parsed.velocidadPromo && (
            <p className="text-sm text-center text-gray-400 mt-1">velocidad de internet</p>
          )}
        </div>

        {/* Contador de vistas */}
        {plan.views_today >= 3 && (
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1 -mt-1">
            <span aria-hidden="true">👀</span>
            Visto {plan.views_today} {plan.views_today === 1 ? 'vez' : 'veces'} hoy
          </p>
        )}

        {/* ── 3. NOMBRE ─────────────────────────────────────────────────── */}
        <h3 className="text-lg font-semibold text-gray-700 text-center leading-tight">
          {name}
        </h3>

        {/* ── 4. FEATURES INFORMATIVAS ──────────────────────────────────── */}
        {parsed.extras.length > 0 && (
          <ul className="flex flex-col gap-2.5 flex-1">
            {parsed.extras.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-base text-gray-600">
                <span className="text-green-500 font-bold text-lg mt-0.5 shrink-0"
                      aria-hidden="true">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        {/* ── 5. CONDICIONES — transparencia promocional ─────────────────── */}
        {hasPromo && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600 mb-1">📋 Condiciones del plan:</p>
            <p>
              • Precio de{' '}
              {parsed.precioPromo.replace(/\s*x\d+\s*meses?/, '')}{' '}
              por {promoDur} meses, luego {parsed.precioRegular}
            </p>
            {velHasPromo && velDur && (
              <p>
                • Velocidad de {extractMbps(parsed.velocidadPromo)} Mbps{' '}
                por {velDur} meses, luego {parsed.velocidadRegular}
              </p>
            )}
          </div>
        )}

        {/* ── Compartir ─────────────────────────────────────────────────── */}
        <div className="group/share relative self-start -mt-2">
          <button
            onClick={handleShare}
            aria-label="Compartir este plan con un amigo"
            className="flex items-center gap-1.5 text-xs text-gray-400
                       hover:text-blue-600 transition-colors duration-150"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth={2}
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>Compartir este plan</span>
          </button>
          <span className="absolute bottom-full left-0 mb-1.5 px-2 py-1 rounded-lg
                           bg-gray-900 text-white text-[10px] font-medium whitespace-nowrap
                           opacity-0 group-hover/share:opacity-100 transition-opacity
                           duration-150 pointer-events-none">
            Compartir con un amigo por WhatsApp
          </span>
        </div>

        {/* ── CTA principal ─────────────────────────────────────────────── */}
        <button
          onClick={handleSelect}
          className="w-full rounded-xl text-white font-bold text-lg
                     min-h-[56px] transition-opacity duration-150 hover:opacity-90
                     active:scale-95"
          style={{ backgroundColor: color }}
        >
          {buttonText}
        </button>

        {/* ── Botón comparar con tooltip ─────────────────────────────────── */}
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
              <><span aria-hidden="true">✓</span><span>En comparación</span></>
            ) : maxReached ? (
              <><span aria-hidden="true">⚖️</span><span>Máximo 3 planes</span></>
            ) : (
              <><span aria-hidden="true">⚖️</span><span>Comparar este plan</span></>
            )}
          </button>
        </div>

      </div>
    </article>
  )
}
