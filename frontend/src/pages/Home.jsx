import { useOperators } from '../hooks/useOperators'
import OperatorCard from '../components/operators/OperatorCard'

function OperatorsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white shadow-md animate-pulse h-56" />
      ))}
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="text-center py-16">
      <p className="text-[#DC2626] mb-5 text-sm">{message}</p>
      <button
        onClick={onRetry}
        className="px-5 py-2 rounded-lg border border-[#E2E8F0] text-[#64748B]
                   text-sm font-medium hover:bg-white transition-colors duration-150"
      >
        Reintentar
      </button>
    </div>
  )
}

export default function Home() {
  const { operators, loading, error, refetch } = useOperators()

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#E2E8F0] py-24 sm:py-32 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block mb-5 px-3 py-1 rounded-full
                           bg-blue-50 text-[#2563EB] text-xs font-semibold tracking-widest uppercase">
            Perú · 2025
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A]
                         leading-tight tracking-tight">
            Encuentra el mejor plan<br />
            <span className="text-[#2563EB]">de internet</span> para tu hogar
          </h1>

          <p className="mt-5 text-lg text-[#64748B] max-w-lg mx-auto leading-relaxed">
            Compara Movistar, Claro, WOW, WIN y Mi Fibra en segundos.
            Sin letra pequeña, sin sorpresas.
          </p>
        </div>
      </section>

      {/* ── Grid de operadores ───────────────────────────────────────────── */}
      <section className="bg-gray-50 py-12 px-4">
        <p className="text-xs font-semibold text-[#64748B] tracking-widest uppercase
                      text-center mb-8">
          Selecciona tu operador
        </p>

        {loading && <OperatorsSkeleton />}
        {error   && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {operators.map((op) => (
              <OperatorCard key={op.id} operator={op} />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA chatbot ───────────────────────────────────────────────────── */}
      <section className="text-center py-16 px-4">
        <div className="inline-flex items-center gap-2 text-sm text-[#64748B]">
          <span>¿No sabes cuál elegir?</span>
          <button
            className="text-[#2563EB] font-semibold underline underline-offset-2
                       hover:text-[#1D4ED8] transition-colors duration-150"
          >
            Habla con nuestro asesor IA →
          </button>
        </div>
      </section>

    </div>
  )
}
