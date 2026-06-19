import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function OperatorCard({ operator }) {
  const navigate    = useNavigate()
  const [logoFailed, setLogoFailed] = useState(false)
  const [ripple,    setRipple]      = useState(null)
  const cardRef     = useRef(null)

  const handleClick = (e) => {
    // Efecto ripple desde el punto de click
    const rect = cardRef.current?.getBoundingClientRect()
    if (rect) {
      setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, key: Date.now() })
    }
    // Pequeño delay para que se vea el ripple antes de navegar
    setTimeout(() => navigate(`/operador/${operator.slug}`, { state: { operator } }), 160)
  }

  return (
    <div
      ref={cardRef}
      className="relative bg-white rounded-2xl shadow-md p-6 flex flex-col
                 items-center gap-3 cursor-pointer overflow-hidden
                 hover:shadow-xl transition-all duration-200
                 hover:-translate-y-1 group"
      style={{ borderTop: `4px solid ${operator.brand_color}` }}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick(e)}
      role="button"
      tabIndex={0}
      aria-label={`Ver planes de ${operator.name}`}
    >
      {/* Ripple */}
      {ripple && (
        <span
          key={ripple.key}
          className="absolute rounded-full animate-ripple pointer-events-none"
          style={{
            left:        ripple.x - 20,
            top:         ripple.y - 20,
            width:       40,
            height:      40,
            backgroundColor: operator.brand_color,
            opacity:     0.35,
          }}
          onAnimationEnd={() => setRipple(null)}
        />
      )}

      {/* Logo con bounce sutil en hover */}
      {!logoFailed ? (
        <div className="w-20 h-20 bg-white rounded-xl p-2 shadow-sm
                        flex items-center justify-center
                        transition-transform duration-200 group-hover:scale-110">
          <img
            src={`/logos/${operator.slug}.png`}
            alt={`Logo de ${operator.name}`}
            className="w-full h-full object-contain"
            onError={() => setLogoFailed(true)}
          />
        </div>
      ) : (
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center
                     text-white text-2xl font-bold select-none
                     transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: operator.brand_color }}
          aria-hidden="true"
        >
          {operator.name.charAt(0).toUpperCase()}
        </div>
      )}

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
      <div
        className="mt-1 w-full py-2 rounded-lg text-white text-sm font-medium
                   text-center select-none transition-all duration-200
                   group-hover:opacity-90 group-hover:shadow-md"
        style={{ backgroundColor: operator.brand_color }}
        aria-hidden="true"
      >
        Ver planes →
      </div>

      {/* Precio mínimo */}
      {operator.min_price != null && (
        <span className="text-sm font-semibold" style={{ color: operator.brand_color }}>
          Desde S/{Number(operator.min_price).toFixed(2)}/mes
        </span>
      )}
    </div>
  )
}
