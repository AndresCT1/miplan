import { useNavigate } from 'react-router-dom'

export default function OperatorCard({ operator }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/operador/${operator.slug}`, { state: { operator } })
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-3
                 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-150"
      style={{ borderTop: `4px solid ${operator.brand_color}` }}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      role="button"
      tabIndex={0}
      aria-label={`Ver planes de ${operator.name}`}
    >
      {/* Círculo con inicial */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center
                   text-white text-2xl font-bold select-none"
        style={{ backgroundColor: operator.brand_color }}
        aria-hidden="true"
      >
        {operator.name.charAt(0).toUpperCase()}
      </div>

      {/* Nombre */}
      <span className="text-base font-semibold text-gray-800 text-center">
        {operator.name}
      </span>

      {/* Plan count */}
      {operator.plan_count !== undefined && (
        <span className="text-xs text-gray-400">
          {operator.plan_count} planes disponibles
        </span>
      )}

      {/* Botón Ver planes */}
      <button
        className="mt-1 w-full py-2 rounded-lg text-white text-sm font-medium
                   transition-opacity hover:opacity-90"
        style={{ backgroundColor: operator.brand_color }}
        onClick={handleClick}
        tabIndex={-1}
        aria-hidden="true"
      >
        Ver planes →
      </button>

      {/* Badge precio mínimo */}
      {operator.min_price != null && (
        <span
          className="text-sm font-semibold"
          style={{ color: operator.brand_color }}
        >
          Desde S/{Number(operator.min_price).toFixed(2)}/mes
        </span>
      )}
    </div>
  )
}
