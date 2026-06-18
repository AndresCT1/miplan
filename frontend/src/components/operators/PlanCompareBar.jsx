import { useNavigate } from 'react-router-dom'
import { useCompare } from '../../context/CompareContext'

function PlanChip({ plan, onRemove }) {
  const color = plan.brandColor || '#2563EB'
  return (
    <div className="flex items-center gap-2 bg-white border-2 rounded-xl px-3 py-2
                    shadow-sm flex-shrink-0"
         style={{ borderColor: color }}>
      <div className="text-center leading-tight">
        <p className="text-xs font-bold text-gray-500 truncate max-w-[80px]">
          {plan.operatorName}
        </p>
        <p className="text-sm font-extrabold" style={{ color }}>
          S/{Number(plan.price).toFixed(2)}
        </p>
        <p className="text-[10px] text-gray-400">{plan.speed_mbps} Mbps</p>
      </div>
      <button
        onClick={() => onRemove(plan.id)}
        aria-label={`Quitar ${plan.name} de la comparación`}
        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600
                   text-gray-500 flex items-center justify-center transition-colors
                   text-sm font-bold flex-shrink-0"
      >
        ×
      </button>
    </div>
  )
}

export default function PlanCompareBar() {
  const navigate = useNavigate()
  const { selectedPlans, removePlan, clearPlans } = useCompare()

  if (selectedPlans.length === 0) return null

  const canCompare = selectedPlans.length >= 2

  const handleCompare = () => {
    const ids = selectedPlans.map((p) => p.id).join(',')
    navigate(`/comparar?ids=${ids}`)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200
                    shadow-2xl">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">

        {/* Label */}
        <div className="flex-shrink-0 hidden sm:block">
          <p className="text-sm font-bold text-gray-700">
            Comparando{' '}
            <span className="text-blue-600">{selectedPlans.length}</span>
            {selectedPlans.length === 1 ? ' plan' : ' planes'}
          </p>
          {!canCompare && (
            <p className="text-xs text-gray-400">Selecciona al menos 2</p>
          )}
        </div>

        {/* Chips con scroll horizontal en mobile */}
        <div className="flex gap-2 flex-1 overflow-x-auto pb-1 scrollbar-hide">
          {selectedPlans.map((plan) => (
            <PlanChip key={plan.id} plan={plan} onRemove={removePlan} />
          ))}
        </div>

        {/* Acciones */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={clearPlans}
            className="px-4 py-2.5 text-sm font-semibold text-gray-600
                       border border-gray-200 rounded-xl hover:bg-gray-50
                       transition-colors min-h-[44px] whitespace-nowrap"
          >
            Limpiar
          </button>

          <button
            onClick={handleCompare}
            disabled={!canCompare}
            title={!canCompare ? 'Selecciona al menos 2 planes' : ''}
            className="px-5 py-2.5 text-sm font-bold text-white rounded-xl
                       transition-colors min-h-[44px] whitespace-nowrap
                       bg-blue-600 hover:bg-blue-700
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Comparar ahora →
          </button>
        </div>
      </div>
    </div>
  )
}
