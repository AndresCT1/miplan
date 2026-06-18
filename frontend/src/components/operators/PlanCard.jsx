import { useNavigate } from 'react-router-dom'

export default function PlanCard({ plan, operatorName = '', operatorId = null }) {
  const navigate = useNavigate()
  const { id, name, speed_mbps, price, features = [], is_featured } = plan

  const handleSelect = () => {
    const params = new URLSearchParams({ plan: id })
    if (operatorId) params.set('operator', operatorId)
    navigate(`/contacto?${params}`, {
      state: { planName: name, operatorName, price, speed_mbps },
    })
  }

  return (
    <div className={`relative rounded-2xl bg-white shadow-sm border p-6 flex flex-col gap-4
      transition-shadow hover:shadow-md
      ${is_featured ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'}`}>

      {is_featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2
          bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          Destacado
        </span>
      )}

      <div>
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        {operatorName && (
          <p className="text-sm text-gray-400">{operatorName}</p>
        )}
      </div>

      <div className="flex items-end gap-1">
        <span className="text-4xl font-extrabold text-gray-900">
          S/{Number(price).toFixed(2)}
        </span>
        <span className="text-gray-400 mb-1">/mes</span>
      </div>

      <div className="flex items-center gap-2 text-blue-600 font-semibold">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {speed_mbps} Mbps
      </div>

      <ul className="flex flex-col gap-2 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={handleSelect}
        className="mt-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700
                   text-white font-semibold transition-colors"
      >
        Quiero este plan
      </button>
    </div>
  )
}
