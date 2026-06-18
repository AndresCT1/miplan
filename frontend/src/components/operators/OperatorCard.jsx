import { useNavigate } from 'react-router-dom'

export default function OperatorCard({ operator }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/operador/${operator.slug}`, { state: { operator } })
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-4
                 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-150"
      style={{ borderTop: `4px solid ${operator.brand_color}` }}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      role="button"
      tabIndex={0}
      aria-label={`Ver planes de ${operator.name}`}
    >
      {/* Círculo con inicial */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
        style={{ backgroundColor: operator.brand_color }}
        aria-hidden="true"
      >
        {operator.name.charAt(0).toUpperCase()}
      </div>

      {/* Nombre */}
      <span className="text-base font-semibold text-gray-800 text-center">
        {operator.name}
      </span>

      {/* Botón Ver planes */}
      <button
        className="mt-auto px-4 py-2 rounded-lg text-white text-sm font-medium
                   transition-opacity hover:opacity-90"
        style={{ backgroundColor: operator.brand_color }}
        onClick={handleClick}
        tabIndex={-1}
        aria-hidden="true"
      >
        Ver planes →
      </button>
    </div>
  )
}
