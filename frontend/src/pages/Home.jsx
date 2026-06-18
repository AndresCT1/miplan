import { useNavigate } from 'react-router-dom'
import { useOperators }      from '../hooks/useOperators'
import { useFeaturedPlans }  from '../hooks/useFeaturedPlans'
import OperatorCard          from '../components/operators/OperatorCard'
import PlanCard              from '../components/operators/PlanCard'

// ── Constantes ──────────────────────────────────────────────────────────────
const WA_NUMBER  = '51999999999' // reemplazar con número real
const WA_MESSAGE = 'Hola, me gustaría comparar planes de internet para mi hogar en Arequipa'
const WA_URL     = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`

// ── Skeletons ────────────────────────────────────────────────────────────────
function OperatorsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-52" />
      ))}
    </div>
  )
}

function PlansSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-80" />
      ))}
    </div>
  )
}

// ── SECCIÓN 1 — Hero ────────────────────────────────────────────────────────
function HeroSection() {
  const navigate = useNavigate()
  return (
    <section className="bg-gradient-to-b from-blue-50 via-blue-50/40 to-white
                        pt-16 pb-20 px-4 text-center">
      <div className="max-w-3xl mx-auto">

        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700
                        text-sm font-semibold px-4 py-2 rounded-full mb-6">
          ⚡ Comparador #1 en Arequipa
        </div>

        {/* Título */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900
                       leading-tight tracking-tight mb-4">
          Encuentra el{' '}
          <span className="text-blue-600">mejor plan</span>
          {' '}de internet{' '}
          <span className="block sm:inline">para tu hogar</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-8">
          Sin letra pequeña.{' '}
          <span className="font-semibold text-gray-700">Sin permanencia.</span>{' '}
          Solo el plan que necesitas.
        </p>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => document.getElementById('operadores')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700
                       text-white font-semibold rounded-xl transition-colors
                       text-base min-h-[48px] shadow-md shadow-blue-200"
          >
            Ver planes →
          </button>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 border-2 border-blue-600
                       text-blue-600 hover:bg-blue-50 font-semibold rounded-xl
                       transition-colors text-base min-h-[48px] flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
                       -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463
                       -2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606
                       .134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025
                       -.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008
                       -.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479
                       0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306
                       1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719
                       2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M11.97 0C5.373 0 0 5.373 0 11.97c0 2.096.546 4.066 1.5 5.775L0
                       24l6.435-1.687A11.928 11.928 0 0011.97 24c6.598 0 11.97-5.373
                       11.97-11.97C23.94 5.373 18.567 0 11.97 0zm0 21.818a9.818 9.818
                       0 01-5.007-1.371l-.359-.214-3.72.975.994-3.624-.234-.372A9.818
                       9.818 0 012.152 11.97C2.152 6.582 6.582 2.152 11.97 2.152c5.389
                       0 9.818 4.43 9.818 9.818 0 5.389-4.43 9.848-9.818 9.848z"/>
            </svg>
            Hablar con asesor
          </a>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8
                        text-sm text-gray-400">
          <span>✓ Sin permanencia</span>
          <span>✓ Instalación gratis</span>
          <span>✓ 500+ familias conectadas</span>
        </div>
      </div>
    </section>
  )
}

// ── SECCIÓN 2 — Operadores ──────────────────────────────────────────────────
function OperatorsSection() {
  const { operators, loading, error, refetch } = useOperators()

  return (
    <section id="operadores" className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Compara los 5 operadores en segundos
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Movistar, Claro, WOW, WIN y Mi Fibra — todos en un solo lugar
          </p>
        </div>

        {loading && <OperatorsSkeleton />}

        {error && (
          <div className="text-center py-10">
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

// ── SECCIÓN 3 — Planes destacados ───────────────────────────────────────────
function FeaturedPlansSection() {
  const { plans, loading } = useFeaturedPlans()

  return (
    <section className="py-16 sm:py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Los planes más populares este mes
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Un plan destacado de cada operador, elegidos por nuestros usuarios
          </p>
        </div>

        {loading ? (
          <PlansSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                operatorName={plan.operator_name}
                operatorId={plan.operator_id}
                brandColor={plan.brand_color}
                mostPopular={plan.operator_slug === 'claro'}
                ctaLabel={`Ver planes de ${plan.operator_name}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ── SECCIÓN 4 — Por qué elegirnos ───────────────────────────────────────────
const WHY_ITEMS = [
  {
    icon: '🔍',
    title: 'Comparamos por ti',
    desc:  'Todos los precios actualizados de Movistar, Claro, WOW, WIN y Mi Fibra en un solo lugar. Sin buscar en 5 páginas distintas.',
  },
  {
    icon: '📱',
    title: 'Te contactamos hoy',
    desc:  'Un asesor real te llama cuando quieras. Sin bots, sin esperas interminables. Lunes a sábado, 9am–8pm.',
  },
  {
    icon: '✅',
    title: 'Sin compromiso',
    desc:  'Ningún plan que recomendamos tiene permanencia forzada. Si no te convence, no hay penalidad. Así de simple.',
  },
]

function WhyUsSection() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Sin complicaciones, sin sorpresas
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Lo que ves es lo que pagas
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {WHY_ITEMS.map(({ icon, title, desc }) => (
            <div key={title}
              className="bg-gray-50 rounded-2xl p-6 flex flex-col gap-3
                         hover:shadow-md transition-shadow duration-150">
              <span className="text-4xl">{icon}</span>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── SECCIÓN 5 — CTA final ───────────────────────────────────────────────────
function CtaSection() {
  const navigate = useNavigate()
  return (
    <section className="py-16 sm:py-20 px-4 bg-[#1E40AF]">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
          ¿No sabes cuál elegir?
        </h2>
        <p className="text-blue-200 text-base sm:text-lg mb-8">
          Nuestro asesor te ayuda gratis en minutos
        </p>
        <button
          onClick={() => navigate('/contacto')}
          className="w-full sm:w-auto px-10 py-4 bg-white text-blue-700 font-bold
                     rounded-xl hover:bg-blue-50 transition-colors text-base
                     min-h-[48px] shadow-lg"
        >
          Quiero que me asesoren
        </button>
        <p className="text-blue-300 text-xs mt-4">
          Respondemos en menos de 2 horas · Lun–Sáb 9am–8pm
        </p>
      </div>
    </section>
  )
}

// ── SECCIÓN 6 — Footer ──────────────────────────────────────────────────────
function FooterSection() {
  const navigate = useNavigate()
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">

        {/* Columna 1 — Brand */}
        <div>
          <span className="text-white font-extrabold text-xl tracking-tight">
            MiPlan<span className="text-blue-400">.pe</span>
          </span>
          <p className="text-sm mt-2 leading-relaxed">
            Encuentra el mejor plan de internet para tu hogar en Arequipa y todo el Perú.
          </p>
        </div>

        {/* Columna 2 — Links */}
        <div>
          <p className="text-white font-semibold text-sm mb-3">Navegación</p>
          <ul className="space-y-2 text-sm">
            {[['Inicio', '/'], ['Operadores', '/#operadores'], ['Contacto', '/contacto']].map(([label, href]) => (
              <li key={label}>
                <button
                  onClick={() => href.startsWith('/#')
                    ? (navigate('/'), setTimeout(() => document.getElementById('operadores')?.scrollIntoView({ behavior: 'smooth' }), 100))
                    : navigate(href)
                  }
                  className="hover:text-white transition-colors"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3 — Contacto */}
        <div>
          <p className="text-white font-semibold text-sm mb-3">Contacto</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-2">
                <span className="text-green-400">●</span> WhatsApp
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span>📍</span> Arequipa, Perú
            </li>
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-gray-800
                      text-xs text-gray-600 text-center">
        MiPlan.pe es un comparador independiente — no somos representantes oficiales
        de ningún operador. Precios referenciales sujetos a disponibilidad en tu zona.
      </div>
    </footer>
  )
}

// ── WhatsApp flotante ────────────────────────────────────────────────────────
function WhatsAppButton() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 left-4 sm:left-6 z-50 w-14 h-14 bg-green-500
                 hover:bg-green-600 rounded-full flex items-center justify-center
                 shadow-lg shadow-green-200 transition-all duration-150
                 hover:scale-110"
    >
      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
                 -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463
                 -2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606
                 .134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025
                 -.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008
                 -.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479
                 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306
                 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719
                 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M11.97 0C5.373 0 0 5.373 0 11.97c0 2.096.546 4.066 1.5 5.775L0
                 24l6.435-1.687A11.928 11.928 0 0011.97 24c6.598 0 11.97-5.373
                 11.97-11.97C23.94 5.373 18.567 0 11.97 0zm0 21.818a9.818 9.818
                 0 01-5.007-1.371l-.359-.214-3.72.975.994-3.624-.234-.372A9.818
                 9.818 0 012.152 11.97C2.152 6.582 6.582 2.152 11.97 2.152c5.389
                 0 9.818 4.43 9.818 9.818 0 5.389-4.43 9.848-9.818 9.848z"/>
      </svg>
    </a>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <OperatorsSection />
      <FeaturedPlansSection />
      <WhyUsSection />
      <CtaSection />
      <FooterSection />
      <WhatsAppButton />
    </div>
  )
}
