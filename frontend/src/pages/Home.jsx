import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useOperators }    from '../hooks/useOperators'
import { useCompare }      from '../context/CompareContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import OperatorCard        from '../components/operators/OperatorCard'
import OfferBanner         from '../components/home/OfferBanner'

function RevealSection({ children, className = '', tag: Tag = 'div' }) {
  const { ref, visible } = useScrollReveal()
  return (
    <Tag
      ref={ref}
      className={`${className} transition-all duration-[400ms] ease-out
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    >
      {children}
    </Tag>
  )
}

const WA_NUMBER  = '51920170692'
const WA_MESSAGE = 'Hola, vi MiPlan.pe y quiero información sobre planes de internet'
const WA_URL     = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`

function WaIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M11.97 0C5.373 0 0 5.373 0 11.97c0 2.096.546 4.066 1.5 5.775L0 24l6.435-1.687A11.928 11.928 0 0011.97 24c6.598 0 11.97-5.373 11.97-11.97C23.94 5.373 18.567 0 11.97 0zm0 21.818a9.818 9.818 0 01-5.007-1.371l-.359-.214-3.72.975.994-3.624-.234-.372A9.818 9.818 0 012.152 11.97C2.152 6.582 6.582 2.152 11.97 2.152c5.389 0 9.818 4.43 9.818 9.818 0 5.389-4.43 9.848-9.818 9.848z"/>
    </svg>
  )
}

// ── 1. HERO ───────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-14 pb-16 px-4 text-center"
             style={{ background: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 40%,#e0f2fe 70%,#f0f9ff 100%)' }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle,#3b82f6,transparent 70%)',
                      animation: 'float-slow 6s ease-in-out infinite' }} />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle,#06b6d4,transparent 70%)',
                      animation: 'float-slow 8s ease-in-out infinite reverse' }} />
      </div>

      <div className="relative max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700
                        text-sm font-semibold px-4 py-2 rounded-full mb-5 animate-pulse-glow">
          ⚡ Comparador #1 en Arequipa
          <span className="text-xs font-bold text-cyan-600 bg-cyan-100 px-2 py-0.5 rounded-full">
            PERÚ · 2025
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900
                       leading-tight tracking-tight mb-4">
          Encuentra el{' '}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            mejor plan
          </span>
          {' '}de internet para tu hogar
        </h1>

        <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-7">
          Sin letra pequeña.{' '}
          <span className="font-semibold text-gray-700">Sin permanencia.</span>{' '}
          Solo el plan que necesitas.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            onClick={() => document.getElementById('operadores')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-semibold
                       text-base min-h-[48px] shadow-md transition-all duration-200
                       hover:scale-105 hover:shadow-lg active:scale-95"
            style={{ background: 'linear-gradient(135deg,#2563eb 0%,#06b6d4 100%)',
                     boxShadow: '0 4px 15px rgba(37,99,235,0.35)' }}
          >
            Ver planes →
          </button>
          <a href={WA_URL} target="_blank" rel="noopener noreferrer"
             className="w-full sm:w-auto px-8 py-4 border-2 border-blue-600 text-blue-600
                        hover:bg-blue-50 font-semibold rounded-xl transition-all duration-200
                        text-base min-h-[48px] flex items-center justify-center gap-2 hover:scale-105">
            <WaIcon className="w-5 h-5" />
            Hablar con asesor
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2
                        text-sm text-gray-400 pt-4 border-t border-blue-100/60">
          <span className="flex items-center gap-1.5">✅ Asesoría 100% gratuita</span>
          <span className="flex items-center gap-1.5">🏠 +1000 familias asesoradas</span>
          <span className="flex items-center gap-1.5">⚡ Respondemos hoy</span>
        </div>
      </div>
    </section>
  )
}

// ── 2. OPERADORES ─────────────────────────────────────────────────────────────
function OperatorsSection() {
  const { operators, loading, error, refetch } = useOperators()

  return (
    <section id="operadores" className="py-10 sm:py-12 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <RevealSection className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            Compara los 5 operadores en segundos
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Movistar, Claro, WOW, WIN y Mi Fibra — todos en un solo lugar
          </p>
        </RevealSection>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-56" />
            ))}
          </div>
        )}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-500 mb-3 text-sm">{error}</p>
            <button onClick={refetch}
              className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
              Reintentar
            </button>
          </div>
        )}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {operators.map((op) => (
              <OperatorCard key={op.id} operator={op} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ── 3. MINI-CTA PLANES DESTACADOS ─────────────────────────────────────────────
function FeaturedPlansCta() {
  return (
    <RevealSection tag="section" className="py-6 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4
                        bg-white rounded-2xl px-6 py-5 shadow-sm border border-gray-100">
          <div>
            <p className="font-bold text-gray-900 text-base">
              ⭐ Mira los planes más populares de este mes
            </p>
            <p className="text-gray-500 text-sm mt-0.5">
              Un plan destacado de cada operador, elegidos por nuestros usuarios
            </p>
          </div>
          <Link
            to="/planes-destacados"
            className="flex-shrink-0 px-5 py-3 bg-blue-600 hover:bg-blue-700
                       text-white font-semibold text-sm rounded-xl min-h-[44px]
                       flex items-center transition-colors whitespace-nowrap"
          >
            Ver planes destacados →
          </Link>
        </div>
      </div>
    </RevealSection>
  )
}

// ── 4. CTA FINAL ──────────────────────────────────────────────────────────────
function CtaSection() {
  const navigate = useNavigate()
  return (
    <section className="py-12 px-4"
             style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#2563eb 50%,#0891b2 100%)' }}>
      <RevealSection className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
          ¿Tienes dudas? Te ayudamos gratis
        </h2>
        <p className="text-blue-200 text-base sm:text-lg mb-7">
          Escríbenos por WhatsApp o llena el formulario y te llamamos hoy
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href={WA_URL} target="_blank" rel="noopener noreferrer"
             className="w-full sm:w-auto px-8 py-4 bg-green-500 hover:bg-green-600
                        text-white font-bold rounded-xl transition-all duration-200
                        text-base min-h-[52px] flex items-center justify-center gap-2
                        shadow-lg hover:scale-105 active:scale-95">
            <WaIcon className="w-5 h-5" />
            WhatsApp ahora
          </a>
          <button
            onClick={() => navigate('/contacto')}
            className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white
                       text-white hover:bg-white/10 font-bold rounded-xl transition-all
                       duration-200 text-base min-h-[52px] hover:scale-105 active:scale-95">
            Que me llamen
          </button>
        </div>
        <p className="text-blue-300 text-sm mt-5">
          Respondemos el mismo día · Lunes a Domingo 7am–10pm · A nivel nacional
        </p>
      </RevealSection>
    </section>
  )
}

// ── 5. FOOTER ─────────────────────────────────────────────────────────────────
function FooterSection() {
  const navigate = useNavigate()
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <span className="text-white font-extrabold text-xl tracking-tight">
            MiPlan<span className="text-blue-400">.pe</span>
          </span>
          <p className="text-sm mt-2 leading-relaxed">
            Comparador independiente de planes de internet en Arequipa, Perú.
          </p>
          <Link to="/nosotros"
                className="inline-block mt-3 text-xs text-blue-400 hover:text-blue-300
                           transition-colors underline underline-offset-2">
            Conoce más sobre nosotros →
          </Link>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">Navegación</p>
          <ul className="space-y-2 text-sm">
            {[
              ['Inicio', '/'],
              ['Planes destacados', '/planes-destacados'],
              ['Comparar planes', '/comparar'],
              ['Nosotros', '/nosotros'],
              ['Contacto', '/contacto'],
            ].map(([label, href]) => (
              <li key={label}>
                <button onClick={() => navigate(href)}
                        className="hover:text-white transition-colors text-left">
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">Contacto</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                 className="hover:text-white transition-colors flex items-center gap-2">
                <span className="text-green-400">●</span>
                <span className="text-white font-medium">WhatsApp: 920 170 692</span>
              </a>
            </li>
            <li className="text-gray-500 text-xs pl-5">Lunes a Domingo 7am – 10pm</li>
            <li className="flex items-center gap-2 text-sm">
              <span aria-hidden="true">📍</span> Arequipa, Perú
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-8 pt-5 border-t border-gray-800
                      text-xs text-gray-600 text-center">
        MiPlan.pe es un comparador independiente — no somos representantes oficiales
        de ningún operador. Precios referenciales sujetos a disponibilidad en tu zona.
      </div>
    </footer>
  )
}

// ── WhatsApp flotante ──────────────────────────────────────────────────────────
function WhatsAppButton() {
  const { selectedPlans } = useCompare()
  const hasBar = selectedPlans.length > 0
  return (
    <div className={`group fixed right-4 sm:right-6 z-50 transition-all duration-300
                     ${hasBar ? 'bottom-[88px]' : 'bottom-4 sm:bottom-6'}`}>
      <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-lg
                       bg-gray-900 text-white text-xs font-medium whitespace-nowrap
                       opacity-0 group-hover:opacity-100 transition-opacity duration-150
                       pointer-events-none hidden sm:block">
        ¡Escríbenos por WhatsApp!
      </span>
      <div className="relative">
        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30"
              aria-hidden="true" />
        <a href={WA_URL} target="_blank" rel="noopener noreferrer"
           aria-label="Contactar por WhatsApp — 920 170 692"
           className="relative w-16 h-16 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600
                      rounded-full flex items-center justify-center
                      shadow-lg shadow-green-300/40
                      transition-all duration-200 hover:scale-110 active:scale-95">
          <WaIcon className="w-8 h-8 sm:w-7 sm:h-7 text-white" />
        </a>
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function Home() {
  useEffect(() => {
    document.title = 'MiPlan.pe — Planes de Internet en Arequipa'
  }, [])

  return (
    <div className="min-h-screen">
      <HeroSection />
      <RevealSection>
        <OfferBanner />
      </RevealSection>
      <OperatorsSection />
      <FeaturedPlansCta />
      <CtaSection />
      <FooterSection />
      <WhatsAppButton />
    </div>
  )
}
