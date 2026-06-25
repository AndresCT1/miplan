import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSeller } from '../../context/SellerContext'

export default function SellerLogin() {
  const { login }                     = useSeller()
  const navigate                      = useNavigate()
  const [email,        setEmail]      = useState('')
  const [pass,         setPass]       = useState('')
  const [loading,      setLoad]       = useState(false)
  const [error,        setErr]        = useState('')
  const [showPassword, setShowPass]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !pass) { setErr('Completa todos los campos'); return }
    setLoad(true); setErr('')
    try {
      await login(email, pass)
      navigate('/equipo', { replace: true })
    } catch (err) {
      setErr(err.message || 'Credenciales incorrectas')
    } finally {
      setLoad(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            MiPlan <span className="text-green-400">Equipo</span>
          </span>
          <p className="text-gray-500 text-sm mt-1">Panel de Ventas</p>
        </div>

        <form onSubmit={handleSubmit}
              className="bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vendedor@miplan.pe"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600
                         text-white placeholder-gray-500 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-11 rounded-xl bg-gray-700 border border-gray-600
                           text-white placeholder-gray-500 text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-gray-400 hover:text-gray-200 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                             a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243
                             M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29
                             m7.532 7.532l3.29 3.29M3 3l3.59 3.59
                             m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7
                             a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5
                             c4.478 0 8.268 2.943 9.542 7
                             -1.274 4.057-5.064 7-9.542 7
                             -4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700
                       disabled:opacity-50 disabled:cursor-not-allowed
                       text-white font-semibold text-sm
                       transition-colors duration-150 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ingresando...
              </>
            ) : 'Ingresar al panel'}
          </button>
        </form>
      </div>
    </div>
  )
}
