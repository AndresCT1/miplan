import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useOperators } from '../hooks/useOperators'
import { usePlans } from '../hooks/usePlans'
import PlanCard from '../components/operators/PlanCard'

function PlansSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-80" />
      ))}
    </div>
  )
}

export default function OperatorPlans() {
  const { slug }     = useParams()
  const location     = useLocation()
  const navigate     = useNavigate()

  // El operator puede venir por navigation state (rápido) o buscarse en la lista
  const { operators } = useOperators()
  const operator = location.state?.operator ?? operators.find((o) => o.slug === slug)

  const { plans, loading, error, refetch } = usePlans(operator?.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors text-sm"
          >
            ← Volver
          </button>
          {operator && (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: operator.brand_color }}
              >
                {operator.name.charAt(0)}
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Planes de {operator.name}
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* Planes */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        {loading && <PlansSkeleton />}

        {error && (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && plans.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No hay planes disponibles en este momento.</p>
          </div>
        )}

        {!loading && !error && plans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} operatorName={operator?.name} operatorId={operator?.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
