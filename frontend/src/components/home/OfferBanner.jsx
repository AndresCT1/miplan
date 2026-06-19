import { useNavigate } from 'react-router-dom'

const CURRENT_OFFER = {
  operatorSlug:  'claro',
  operatorColor: '#DA291C',
  title:         'Oferta del mes',
  subtitle:      'Internet 400 Mbps con Claro desde',
  price:         '1.00',
  priceNote:     '/primer mes',
  regularPrice:  'S/89.90',
  badge:         '⏰ Solo este mes',
  ctaText:       'Ver esta oferta →',
}

export default function OfferBanner() {
  const navigate = useNavigate()
  const { operatorSlug, operatorColor, title, subtitle, price,
          priceNote, regularPrice, badge, ctaText } = CURRENT_OFFER

  const darkColor = '#A81F15'

  return (
    <div className="px-4 py-6">
      <div
        className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden
                   shadow-xl shadow-red-900/20"
        style={{
          background: `linear-gradient(135deg, ${operatorColor} 0%, ${darkColor} 100%)`,
        }}
      >
        {/* Badge esquina superior derecha */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4
                        bg-white/20 backdrop-blur-sm text-white text-xs font-bold
                        px-3 py-1.5 rounded-full border border-white/30">
          {badge}
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10
                        flex flex-col sm:flex-row items-center gap-6 sm:gap-10">

          {/* Ícono animado */}
          <div className="text-6xl animate-pulse flex-shrink-0 hidden sm:block"
               aria-hidden="true">
            🔥
          </div>

          {/* Texto */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start
                            gap-2 mb-2">
              <span className="text-3xl animate-pulse sm:hidden"
                    aria-hidden="true">🔥</span>
              <p className="text-white/80 text-sm font-semibold uppercase tracking-wider">
                {title}
              </p>
            </div>

            <p className="text-white text-lg sm:text-xl font-medium mb-3 leading-snug">
              {subtitle}
            </p>

            {/* Precio */}
            <div className="flex items-end justify-center sm:justify-start gap-1 mb-1">
              <span className="text-white/80 text-2xl font-bold mb-1">S/</span>
              <span className="text-white text-6xl sm:text-7xl font-extrabold leading-none
                               tabular-nums">
                {price}
              </span>
              <span className="text-white/70 text-base font-medium mb-2">
                {priceNote}
              </span>
            </div>

            <p className="text-white/60 text-sm line-through">
              Precio regular {regularPrice}
            </p>
          </div>

          {/* CTA */}
          <div className="w-full sm:w-auto flex-shrink-0">
            <button
              onClick={() => navigate(`/operador/${operatorSlug}`)}
              className="w-full sm:w-auto px-8 py-4 bg-white rounded-xl
                         font-bold text-base min-h-[52px] whitespace-nowrap
                         transition-all duration-200 hover:scale-105
                         hover:shadow-lg active:scale-95"
              style={{ color: operatorColor }}
            >
              {ctaText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
