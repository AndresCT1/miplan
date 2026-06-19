import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const WA_URL = 'https://wa.me/51920170692?text=' +
  encodeURIComponent('Hola, vi MiPlan.pe y quiero información sobre planes de internet')

const HOW_STEPS = [
  {
    num: '1', icon: '📡',
    title: 'Elige tu operador',
    desc:  'Compara Movistar, Claro, WOW, WIN y Mi Fibra en un solo lugar. Sin publicidad engañosa, solo datos reales.',
  },
  {
    num: '2', icon: '📋',
    title: 'Selecciona tu plan',
    desc:  'Precios claros, sin letra pequeña. Ves exactamente lo que pagas antes de comprometerte.',
  },
  {
    num: '3', icon: '📞',
    title: 'Te llamamos hoy',
    desc:  'Un asesor real de MiPlan.pe te contacta gratis, verifica la cobertura en tu dirección y coordina la instalación.',
  },
]

const WHY_ITEMS = [
  {
    icon: '🔍', bg: 'bg-blue-50',
    title: 'Comparamos por ti',
    desc:  'Revisamos las promociones de todos los operadores para que tú no tengas que hacerlo. Ahorramos tu tiempo.',
  },
  {
    icon: '📱', bg: 'bg-green-50',
    title: 'Un asesor real te llama',
    desc:  'No chatbots, no formularios infinitos. Una persona real te explica todo en tu idioma.',
  },
  {
    icon: '✅', bg: 'bg-cyan-50',
    title: 'Sin costo, sin compromiso',
    desc:  'Nuestro servicio es completamente gratuito. Tú decides si contratas o no, sin presión.',
  },
  {
    icon: '🛡️', bg: 'bg-purple-50',
    title: 'Independientes y transparentes',
    desc:  'No somos representantes de ningún operador. Te recomendamos el mejor plan según TU necesidad, no la nuestra.',
  },
  {
    icon: '⚡', bg: 'bg-yellow-50',
    title: 'Respondemos el mismo día',
    desc:  'De lunes a sábado de 9am a 7pm. También por WhatsApp fuera de ese horario.',
  },
  {
    icon: '📍', bg: 'bg-red-50',
    title: 'Especializados en Arequipa',
    desc:  'Conocemos la cobertura real de cada operador en cada distrito de Arequipa y provincias cercanas.',
  },
]

export default function About() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Sobre MiPlan.pe | Comparador de Internet en Arequipa'
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900
                       text-sm font-medium transition-colors min-h-[44px]"
          >
            ← Volver
          </button>
          <Link to="/" className="text-blue-600 font-extrabold text-lg hidden sm:block">
            MiPlan<span className="text-gray-900">.pe</span>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">

        {/* Intro */}
        <div className="text-center mb-14">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Sobre MiPlan.pe
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Somos un comparador independiente de planes de internet en Arequipa, Perú.
            Nuestra misión es ayudarte a encontrar el mejor plan para tu hogar,
            sin letra pequeña y sin presión.
          </p>
        </div>

        {/* Cómo funciona */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Así de fácil es encontrar tu plan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {HOW_STEPS.map(({ num, icon, title, desc }) => (
              <div key={num}
                   className="bg-white rounded-2xl p-6 flex flex-col items-center
                              text-center gap-3 shadow-sm border border-gray-100">
                <div className="w-14 h-14 rounded-full text-white flex items-center
                                justify-center text-2xl font-extrabold shadow-md shadow-blue-200"
                     style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}>
                  {num}
                </div>
                <span className="text-3xl" aria-hidden="true">{icon}</span>
                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Por qué elegirnos */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            ¿Por qué elegir MiPlan.pe?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_ITEMS.map(({ icon, bg, title, desc }) => (
              <div key={title}
                   className="bg-white rounded-2xl p-5 flex flex-col gap-3
                              shadow-sm border border-gray-100
                              hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                  <span className="text-2xl" aria-hidden="true">{icon}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">
            ¿Listo para encontrar tu plan?
          </h2>
          <p className="text-blue-100 mb-6">
            Es gratis, rápido y sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-3.5 bg-white text-blue-600 font-bold rounded-xl
                         min-h-[48px] flex items-center justify-center
                         transition-all hover:scale-105 hover:shadow-lg"
            >
              Ver planes disponibles →
            </Link>
            <a
              href={WA_URL} target="_blank" rel="noopener noreferrer"
              className="px-6 py-3.5 border-2 border-white text-white font-bold
                         rounded-xl min-h-[48px] flex items-center justify-center
                         transition-all hover:bg-white/10"
            >
              💬 WhatsApp 920 170 692
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
