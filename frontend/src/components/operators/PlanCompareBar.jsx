import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCompare } from '../../context/CompareContext'

function PlanLogo({ slug, name, color }) {
  const [failed, setFailed] = useState(false)
  if (!slug || failed) {
    return (
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0"
           style={{ backgroundColor: `${color}20`, color }}>
        {name?.charAt(0) ?? '?'}
      </div>
    )
  }
  return (
    <img
      src={`/logos/${slug}.png`}
      alt={name}
      className="w-8 h-8 object-contain flex-shrink-0"
      onError={() => setFailed(true)}
    />
  )
}

function PlanChip({ plan, onRemove, dark = false }) {
  const color = plan.brandColor || '#2563EB'
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 flex-shrink-0 border
                     ${dark ? 'bg-white/15 border-white/20' : 'bg-white border-gray-200 shadow-sm'}`}>
      <PlanLogo slug={plan.operatorSlug} name={plan.operatorName} color={color} />
      <div className="leading-tight">
        <p className={`text-[11px] font-bold truncate max-w-[72px]
                       ${dark ? 'text-white/80' : 'text-gray-500'}`}>
          {plan.operatorName}
        </p>
        <p className={`text-sm font-extrabold ${dark ? 'text-white' : ''}`}
           style={dark ? {} : { color }}>
          S/{Number(plan.price).toFixed(2)}
        </p>
      </div>
      <button
        onClick={() => onRemove(plan.id)}
        aria-label={`Quitar ${plan.name}`}
        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    transition-colors ${dark
                      ? 'bg-white/20 hover:bg-white/40 text-white'
                      : 'bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-400'}`}
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

  // ── Estado 1: un solo plan — barra azul, instructiva ─────────────────────────
  if (!canCompare) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-blue-600 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">

          {/* Mensaje instructivo */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-2xl animate-bounce flex-shrink-0" aria-hidden="true">↑</span>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight">
                ⚖️ 1 plan seleccionado
              </p>
              <p className="text-blue-100 text-sm leading-tight">
                Agrega 1 plan más para poder comparar
              </p>
            </div>
          </div>

          {/* Chip del plan seleccionado */}
          <div className="flex gap-2 overflow-x-auto flex-shrink-0 max-w-[40%]">
            {selectedPlans.map((plan) => (
              <PlanChip key={plan.id} plan={plan} onRemove={removePlan} dark />
            ))}
          </div>

          {/* Limpiar */}
          <button
            onClick={clearPlans}
            className="text-blue-200 hover:text-white text-sm font-medium
                       transition-colors flex-shrink-0 min-h-[44px] px-2"
          >
            Limpiar
          </button>
        </div>
      </div>
    )
  }

  // ── Estado 2-3: listo para comparar — barra blanca, botón verde ──────────────
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">

        {/* Mensaje de éxito */}
        <div className="flex-shrink-0 hidden sm:block min-w-[160px]">
          <p className="text-sm font-extrabold text-gray-800 leading-tight">
            ¡Listo para comparar!
          </p>
          <p className="text-sm text-gray-500 leading-tight">
            {selectedPlans.length} planes seleccionados
          </p>
        </div>

        {/* Chips con logo + precio */}
        <div className="flex gap-2 flex-1 overflow-x-auto py-1">
          {selectedPlans.map((plan) => (
            <PlanChip key={plan.id} plan={plan} onRemove={removePlan} />
          ))}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={clearPlans}
            className="text-gray-400 hover:text-gray-600 text-sm font-medium
                       transition-colors min-h-[44px] px-2 whitespace-nowrap"
          >
            Limpiar
          </button>

          <button
            onClick={handleCompare}
            className="px-5 py-3 bg-green-500 hover:bg-green-600 text-white
                       font-bold text-sm rounded-xl transition-colors
                       min-h-[48px] whitespace-nowrap shadow-md shadow-green-200
                       active:scale-95"
          >
            Ver comparación →
          </button>
        </div>
      </div>
    </div>
  )
}
