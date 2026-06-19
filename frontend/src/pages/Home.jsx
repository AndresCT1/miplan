import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOperators }      from '../hooks/useOperators'
import { useFeaturedPlans }  from '../hooks/useFeaturedPlans'
import { useCompare }        from '../context/CompareContext'
import { useScrollReveal }   from '../hooks/useScrollReveal'
import OperatorCard          from '../components/operators/OperatorCard'
import PlanCard              from '../components/operators/PlanCard'
import OfferBanner           from '../components/home/OfferBanner'

// Fade-up al entrar en viewport
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

// ── Constantes WhatsApp ───────────────────────────────────────────────────────
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

// ── Skeletons ─────────────────────────────────────────────────────────────────
function OperatorsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-56" />
      ))}
    </div>
  )
}

function PlansSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-80" />
      ))}
    </div>
  )
}

// ── SECCIÓN 1 — Hero (con trust integrado) ────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-14 pb-16 px-4 text-center"
             style={{
               background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #e0f2fe 70%, #f0f9ff 100%)',
             }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)',
                      animation: 'float-slow 6s ease-in-out infinite' }} />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)',
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
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                     boxShadow: '0 4px 15px rgba(37,99,235,0.35)' }}
          >
            Ver planes →
          </button>
          <a href={WA_URL} target="_blank" rel="noopener noreferrer"
             className="w-full sm:w-auto px-8 py-4 border-2 border-blue-600
                        text-blue-600 hover:bg-blue-50 font-semibold rounded-xl
                        transition-all duration-200 text-base min-h-[48px]
                        flex items-center justify-center gap-2 hover:scale-105">
            <WaIcon className="w-5 h-5" />
            Hablar con asesor
          </a>
        </div>

        {/* Trust bar integrado en el hero — sin sección separada */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2
                        text-sm text-gray-400 pt-4 border-t border-blue-100/60">
          <span className="flex items-center gap-1.5"><span>✅</span> Asesoría 100% gratuita</span>
          <span className="flex items-center gap-1.5"><span>🏠</span> +1000 familias asesoradas</span>
          <span className="flex items-center gap-1.5"><span>⚡</span> Respondemos hoy</span>
        </div>
      </div>
    </section>
  )
}

// ── GUÍA COMPARADOR — visible solo sin planes seleccionados ───────────────────
const COMPARE_STEPS = [
  { num: '1', icon: '📡', title: 'Elige un operador',            desc: 'Claro, Movistar, WOW, WIN o Mi Fibra' },
  { num: '2', icon: '⚖️', title: 'Toca "Comparar" en los planes', desc: 'Elige hasta 3 planes que te interesen' },
  { num: '3', icon: '📊', title: 'Ve la comparación',             desc: 'Precio, velocidad y beneficios juntos' },
]

function CompareGuideSection() {
  const { selectedPlans } = useCompare()
  if (selectedPlans.length > 0) return null

  return (
    <section className="px-4 pt-5 pb-2 bg-white" aria-label="Cómo comparar planes">
      <div className="max-w-5xl mx-auto">
        <div className="bg-blue-50 rounded-2xl px-6 py-6">
          <p className="text-center font-bold text-gray-900 mb-5 text-lg">
            ¿Quieres comparar planes?{' '}
            <span className="text-blue-600 font-normal text-base">
              Selecciona hasta 3 y los comparamos por ti
            </span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
            {COMPARE_STEPS.map(({ num, icon, title, desc }, i) => (
              <div key={num} className="flex sm:contents items-center gap-4 sm:gap-0">
                <div className="flex flex-col items-center text-center gap-1.5 sm:px-6">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white
                                  flex items-center justify-center text-lg font-extrabold
                                  shadow-md shadow-blue-200">
                    {num}
                  </div>
                  <span className="text-xl" aria-hidden="true">{icon}</span>
                  <p className="text-sm font-bold text-gray-800 max-w-[120px] leading-tight">{title}</p>
                  <p className="text-xs text-gray-500 max-w-[120px]">{desc}</p>
                </div>
                {i < COMPARE_STEPS.length - 1 && (
                  <span className="text-blue-400 text-2xl rotate-90 sm:rotate-0 flex-shrink-0"
                        aria-hidden="true">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── SECCIÓN 2 — Operadores ────────────────────────────────────────────────────
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

        {loading && <OperatorsSkeleton />}
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

// ── SECCIÓN 3 — Planes destacados (3 visibles, expandibles) ───────────────────
const INITIAL_VISIBLE = 3

function FeaturedPlansSection() {
  const { plans, loading } = useFeaturedPlans()
  const navigate           = useNavigate()
  const [showAll, setShowAll] = useState(false)

  const visible = showAll ? plans : plans.slice(0, INITIAL_VISIBLE)
  const hasMore = plans.length > INITIAL_VISIBLE

  return (
    <section className="py-10 sm:py-12 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <RevealSection className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            Los planes más populares este mes
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Un plan destacado de cada operador, elegidos por nuestros usuarios
          </p>
        </RevealSection>

        {loading ? (
          <PlansSkeleton count={3} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  operatorName={plan.operator_name}
                  operatorId={plan.operator_id}
                  operatorSlug={plan.operator_slug}
                  brandColor={plan.brand_color}
                  mostPopular={plan.operator_slug === 'claro'}
                  ctaLabel={`Ver planes de ${plan.operator_name}`}
                  onSelect={() => navigate(`/operador/${plan.operator_slug}`)}
                />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600
                             font-semibold text-sm hover:border-blue-300 hover:text-blue-600
                             transition-all duration-200 min-h-[48px]"
                >
                  {showAll
                    ? '↑ Ver menos'
                    : `Ver ${plans.length - INITIAL_VISIBLE} planes más →`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

// ── SECCIÓN 4 — Por qué MiPlan (fusión de HowItWorks + WhyUs) ────────────────
const TRUST_POINTS = [
  {
    icon: '🔍',
    bg:   'bg-blue-50',
    title: 'Comparamos los 5 operadores',
    desc:  'Claro, Movistar, WOW, WIN y Mi Fibra en un solo lugar. Precios reales, sin letra pequeña.',
  },
  {
    icon: '📞',
    bg:   'bg-green-50',
    title: 'Un asesor real te llama hoy',
    desc:  'No chatbots ni esperas. Te contactamos gratis y coordinamos la instalación a tu medida.',
  },
  {
    icon: '✅',
    bg:   'bg-cyan-50',
    title: 'Sin costo, sin permanencia',
    desc:  'Nuestro servicio es 100% gratuito. Tú decides cuándo y si contratas.',
  },
]

function TrustSection() {
  return (
    <section className="py-10 sm:py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <RevealSection className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            Sin complicaciones, sin sorpresas
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">Lo que ves es lo que pagas</p>
        </RevealSection>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TRUST_POINTS.map(({ icon, bg, title, desc }) => (
            <RevealSection key={title}>
              <div className="bg-white rounded-2xl p-5 flex flex-col gap-3 h-full
                              shadow-sm border border-gray-100
                              hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center`}>
                  <span className="text-3xl" aria-hidden="true">{icon}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── SECCIÓN 5 — CTA final ─────────────────────────────────────────────────────
function CtaSection() {
  const navigate = useNavigate()
  return (
    <section className="py-12 px-4"
             style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0891b2 100%)' }}>
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
                        text-white font-bold rounded-xl transition-all duration-200 text-base
                        min-h-[52px] flex items-center justify-center gap-2 shadow-lg
                        hover:scale-105 active:scale-95">
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

// ── SECCIÓN 6 — Footer ────────────────────────────────────────────────────────
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
            Encuentra el mejor plan de internet para tu hogar en Arequipa y todo el Perú.
          </p>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">Navegación</p>
          <ul className="space-y-2 text-sm">
            {[['Inicio', '/'], ['Operadores', '/#operadores'], ['Contacto', '/contacto']].map(([label, href]) => (
              <li key={label}>
                <button
                  onClick={() => href.startsWith('/#')
                    ? (navigate('/'), setTimeout(() => document.getElementById('operadores')?.scrollIntoView({ behavior: 'smooth' }), 100))
                    : navigate(href)}
                  className="hover:text-white transition-colors">
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
      <CompareGuideSection />
      <OperatorsSection />
      <FeaturedPlansSection />
      <TrustSection />
      <CtaSection />
      <FooterSection />
      <WhatsAppButton />
    </div>
  )
}
