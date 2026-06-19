const FILTERS = [
  { key: 'all',  label: 'Todos' },
  { key: 'low',  label: 'Hasta S/60' },
  { key: 'mid',  label: 'S/60 – S/90' },
  { key: 'high', label: 'Más de S/90' },
]

export default function PriceFilter({ active, onChange, brandColor }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      role="group"
      aria-label="Filtrar por precio"
      style={{ scrollbarWidth: 'none' }}
    >
      {FILTERS.map(({ key, label }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold
                       min-h-[44px] transition-all duration-150 border-2 whitespace-nowrap"
            style={
              isActive
                ? { backgroundColor: brandColor, borderColor: brandColor, color: '#fff' }
                : { backgroundColor: '#fff', borderColor: '#D1D5DB', color: '#6B7280' }
            }
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
