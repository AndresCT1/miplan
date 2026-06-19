import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const OFFERS = [
  {
    operatorSlug: 'claro',
    color:        '#DA291C',
    title:        'Oferta del mes',
    subtitle:     'Internet 400 Mbps con Claro desde',
    price:        '1.00',
    priceNote:    '/primer mes',
    regularPrice: 'S/89.90',
    badge:        '🔥 Mejor precio',
  },
  {
    operatorSlug: 'mifibra',
    color:        '#E91E8C',
    title:        'El más económico',
    subtitle:     'Internet 1000 Mbps con Mi Fibra desde',
    price:        '59.90',
    priceNote:    '/mes',
    regularPrice: null,
    badge:        '💎 Mejor relación precio-velocidad',
  },
  {
    operatorSlug: 'wow',
    color:        '#9B59B6',
    title:        'Internet + Streaming',
    subtitle:     'WOW 1000 Mbps con Liga 1 MAX y Prime Video',
    price:        '99.90',
    priceNote:    '/mes',
    regularPrice: null,
    badge:        '⭐ Todo incluido',
  },
  {
    operatorSlug: 'movistar',
    color:        '#00A8E0',
    title:        'Velocidad simétrica',
    subtitle:     'Movistar Fibra 400 Mbps desde',
    price:        '79.90',
    priceNote:    '/mes',
    regularPrice: null,
    badge:        '🚀 Sube y baja igual de rápido',
  },
  {
    operatorSlug: 'win',
    color:        '#FF6B00',
    title:        'Sin permanencia',
    subtitle:     'WIN Fibra 750 Mbps desde',
    price:        '99.00',
    priceNote:    '/mes',
    regularPrice: null,
    badge:        '✅ Cancela cuando quieras',
  },
]

const INTERVAL_MS = 5000

function ChevronLeft() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

export default function OfferBanner() {
  const navigate      = useNavigate()
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX   = useRef(null)
  const total         = OFFERS.length

  const go = useCallback((idx) => {
    setCurrent(((idx % total) + total) % total)
  }, [total])

  const prev = useCallback(() => go(current - 1), [current, go])
  const next = useCallback(() => go(current + 1), [current, go])

  // Auto-rotate — respeta prefers-reduced-motion
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return
    const id = setInterval(next, INTERVAL_MS)
    return () => clearInterval(id)
  }, [isPaused, next])

  // Touch swipe
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    setIsPaused(true)
  }
  const onTouchEnd = (e) => {
    setIsPaused(false)
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 48) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  return (
    <div className="px-4 py-6">
      <div
        className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-xl select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-label="Ofertas destacadas"
      >
        {/* ── Slides ──────────────────────────────────────────────────────────── */}
        <div className="relative h-64 sm:h-52">
          {OFFERS.map((offer, i) => {
            const active = i === current
            return (
              <div
                key={offer.operatorSlug}
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  opacity:        active ? 1 : 0,
                  pointerEvents:  active ? 'auto' : 'none',
                  backgroundColor: offer.color,
                }}
                aria-hidden={!active}
              >
                {/* Gradiente oscuro overlay */}
                <div className="absolute inset-0 pointer-events-none"
                     style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.30) 100%)' }} />

                {/* Badge */}
                <div className="absolute top-3 right-12 sm:right-16
                                bg-white/20 backdrop-blur-sm text-white
                                text-xs font-bold px-3 py-1.5 rounded-full
                                border border-white/30 leading-none">
                  {offer.badge}
                </div>

                {/* Contenido */}
                <div className="relative h-full flex flex-col sm:flex-row
                                items-center gap-4 sm:gap-8
                                px-6 py-5 sm:px-10">

                  {/* Texto */}
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <p className="text-white/75 text-xs font-semibold uppercase
                                  tracking-widest mb-1">
                      {offer.title}
                    </p>
                    <p className="text-white text-sm sm:text-base font-medium
                                  leading-snug mb-3">
                      {offer.subtitle}
                    </p>

                    {/* Precio */}
                    <div className="flex items-end justify-center sm:justify-start gap-1">
                      <span className="text-white/80 text-lg font-bold mb-0.5">S/</span>
                      <span className="text-white text-5xl sm:text-6xl font-extrabold
                                       leading-none tabular-nums">
                        {offer.price}
                      </span>
                      <span className="text-white/70 text-sm font-medium mb-1">
                        {offer.priceNote}
                      </span>
                    </div>
                    {offer.regularPrice && (
                      <p className="text-white/50 text-xs line-through mt-1">
                        Precio regular {offer.regularPrice}
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => navigate(`/operador/${offer.operatorSlug}`)}
                      className="w-full sm:w-auto px-7 py-3.5 bg-white rounded-xl
                                 font-bold text-sm sm:text-base min-h-[48px]
                                 whitespace-nowrap transition-all duration-200
                                 hover:scale-105 hover:shadow-lg active:scale-95"
                      style={{ color: offer.color }}
                    >
                      Ver esta oferta →
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Flechas (desktop) ────────────────────────────────────────────── */}
        <button
          onClick={prev}
          aria-label="Oferta anterior"
          className="hidden sm:flex absolute left-3 top-[calc(50%-20px)]
                     w-9 h-9 rounded-full bg-black/20 hover:bg-black/35
                     text-white items-center justify-center
                     transition-colors duration-150 z-10"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={next}
          aria-label="Siguiente oferta"
          className="hidden sm:flex absolute right-3 top-[calc(50%-20px)]
                     w-9 h-9 rounded-full bg-black/20 hover:bg-black/35
                     text-white items-center justify-center
                     transition-colors duration-150 z-10"
        >
          <ChevronRight />
        </button>

        {/* ── Dots ─────────────────────────────────────────────────────────── */}
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2
                     flex items-center gap-1.5 z-10"
          role="tablist"
          aria-label="Diapositivas"
        >
          {OFFERS.map((offer, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Oferta ${i + 1}: ${offer.title}`}
              onClick={() => go(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width:           i === current ? '20px' : '8px',
                height:          '8px',
                backgroundColor: i === current ? 'white' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
