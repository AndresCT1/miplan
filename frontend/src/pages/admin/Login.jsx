import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'

export default function Login() {
  const { login }          = useAdmin()
  const navigate           = useNavigate()
  const [email, setEmail]  = useState('')
  const [pass,  setPass]   = useState('')
  const [loading, setLoad] = useState(false)
  const [error,   setErr]  = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !pass) { setErr('Completa todos los campos'); return }
    setLoad(true); setErr('')
    try {
      await login(email, pass)
      navigate('/admin', { replace: true })
    } catch (err) {
      setErr(err.message || 'Credenciales incorrectas')
    } finally {
      setLoad(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            MiPlan <span className="text-blue-400">Admin</span>
          </span>
          <p className="text-gray-500 text-sm mt-1">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit}
              className="bg-gray-800 rounded-2xl p-8 shadow-xl space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@miplan.pe"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600
                         text-white placeholder-gray-500 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600
                         text-white placeholder-gray-500 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700
                       disabled:opacity-50 disabled:cursor-not-allowed
                       text-white font-semibold text-sm
                       transition-colors duration-150 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ingresando...
              </>
            ) : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
