import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useFeaturedPlans } from '../hooks/useFeaturedPlans'
import PlanCard             from '../components/operators/PlanCard'

function PlansSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-80" />
      ))}
    </div>
  )
}

export default function FeaturedPlans() {
  const navigate           = useNavigate()
  const { plans, loading } = useFeaturedPlans()

  useEffect(() => {
    document.title = 'Planes más populares | MiPlan.pe'
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900
                       text-sm font-medium transition-colors min-h-[44px]"
          >
            ← Volver al inicio
          </button>
          <Link to="/" className="text-blue-600 font-extrabold text-lg hidden sm:block">
            MiPlan<span className="text-gray-900">.pe</span>
          </Link>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700
                          text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-yellow-200">
            ⭐ Más pedidos este mes
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            Los planes más populares
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Un plan destacado de cada operador, elegidos por nuestros usuarios en Arequipa
          </p>
        </div>

        {loading ? (
          <PlansSkeleton />
        ) : plans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No hay planes destacados disponibles.</p>
            <Link to="/" className="mt-4 inline-block text-blue-600 underline">
              Ver todos los operadores
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
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
        )}

        {/* CTA inferior */}
        <div className="text-center mt-12 pt-10 border-t border-gray-200">
          <p className="text-gray-500 text-base mb-4">
            ¿Quieres comparar varios planes antes de decidir?
          </p>
          <Link
            to="/comparar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600
                       hover:bg-blue-700 text-white font-semibold rounded-xl
                       transition-colors min-h-[48px]"
          >
            ⚖️ Ir al comparador de planes
          </Link>
        </div>
      </main>
    </div>
  )
}
