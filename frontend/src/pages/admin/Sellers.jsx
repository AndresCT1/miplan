import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services/api'

// ── Helpers ───────────────────────────────────────────────────────────────────
function EyeIcon({ visible }) {
  return visible ? (
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
               -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function PasswordInput({ value, onChange, placeholder = '••••••••', autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-300 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2
                   text-gray-400 hover:text-gray-600 transition-colors"
      >
        <EyeIcon visible={show} />
      </button>
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Cerrar"
          >×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Modal: Crear vendedor ─────────────────────────────────────────────────────
function CreateModal({ onClose, onCreated }) {
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [created, setCreated] = useState(null) // vendedor recién creado con temp pwd

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim())       { setError('El nombre es requerido'); return }
    if (!form.email.trim())      { setError('El email es requerido'); return }
    if (form.password.length < 6){ setError('Contraseña mínimo 6 caracteres'); return }
    setLoading(true); setError('')
    try {
      const seller = await adminService.createSeller(form)
      setCreated({ ...seller, tempPassword: form.password })
      onCreated(seller)
    } catch (err) {
      setError(err.message || 'Error al crear el vendedor')
    } finally {
      setLoading(false)
    }
  }

  if (created) return (
    <Modal title="Vendedor creado" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-semibold text-gray-900">{created.name}</p>
          <p className="text-sm text-gray-500">{created.email}</p>
        </div>
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <p className="text-sm font-bold text-amber-800 mb-2">
            ⚠️ Guarda esta contraseña, no se mostrará de nuevo:
          </p>
          <p className="font-mono text-lg font-bold text-amber-900 tracking-wider text-center bg-amber-100 rounded-lg py-2 px-3">
            {created.tempPassword}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white
                     font-semibold text-sm rounded-xl transition-colors"
        >
          Entendido, ya guardé la contraseña
        </button>
      </div>
    </Modal>
  )

  return (
    <Modal title="Agregar vendedor" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <input
            type="text" value={form.name} onChange={set('name')}
            placeholder="Juan Pérez"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email" value={form.email} onChange={set('email')}
            placeholder="vendedor@miplan.pe"
            autoComplete="off"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña temporal</label>
          <PasswordInput
            value={form.password}
            onChange={set('password')}
            autoComplete="new-password"
          />
          <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white
                     font-semibold text-sm rounded-xl transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {loading
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creando...</>
            : 'Crear vendedor'}
        </button>
      </form>
    </Modal>
  )
}

// ── Modal: Editar vendedor ────────────────────────────────────────────────────
function EditModal({ seller, onClose, onUpdated }) {
  const [form, setForm]       = useState({ name: seller.name, email: seller.email, active: seller.active })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const updated = await adminService.updateSeller(seller.id, form)
      onUpdated(updated)
      onClose()
    } catch (err) {
      setError(err.message || 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={`Editar: ${seller.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text" value={form.name} onChange={set('name')}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email" value={form.email} onChange={set('email')}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm(p => ({ ...p, active: !p.active }))}
            className={`relative w-11 h-6 rounded-full transition-colors duration-150
                        ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}
            aria-label={form.active ? 'Desactivar vendedor' : 'Activar vendedor'}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                              shadow transition-transform duration-150
                              ${form.active ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className="text-sm text-gray-700">
            {form.active ? 'Vendedor activo' : 'Vendedor inactivo'}
          </span>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white
                     font-semibold text-sm rounded-xl transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {loading
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando...</>
            : 'Guardar cambios'}
        </button>
      </form>
    </Modal>
  )
}

// ── Modal: Resetear contraseña ────────────────────────────────────────────────
function ResetPasswordModal({ seller, onClose, onReset }) {
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [done,     setDone]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return }
    setLoading(true); setError('')
    try {
      await adminService.resetSellerPassword(seller.id, password)
      setDone(true)
      onReset()
    } catch (err) {
      setError(err.message || 'Error al resetear la contraseña')
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <Modal title="Contraseña reseteada" onClose={onClose}>
      <div className="text-center space-y-4">
        <p className="text-4xl">✅</p>
        <p className="text-gray-700 font-medium">
          La contraseña de <strong>{seller.name}</strong> fue actualizada.
        </p>
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <p className="text-sm font-bold text-amber-800 mb-2">
            ⚠️ Nueva contraseña (guárdala ahora):
          </p>
          <p className="font-mono text-lg font-bold text-amber-900 tracking-wider bg-amber-100 rounded-lg py-2 px-3">
            {password}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white
                     font-semibold text-sm rounded-xl transition-colors"
        >
          Entendido
        </button>
      </div>
    </Modal>
  )

  return (
    <Modal title={`Resetear contraseña: ${seller.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          ¿Seguro que quieres resetear la contraseña de <strong>{seller.name}</strong>?
          La nueva contraseña reemplazará la anterior inmediatamente.
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white
                     font-semibold text-sm rounded-xl transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {loading
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Reseteando...</>
            : 'Resetear contraseña'}
        </button>
      </form>
    </Modal>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AdminSellers() {
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const [createOpen,      setCreateOpen]      = useState(false)
  const [editSeller,      setEditSeller]      = useState(null)
  const [resetSeller,     setResetSeller]     = useState(null)

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const data = await adminService.getSellers()
      setSellers(data)
    } catch (err) {
      setError(err.message || 'Error al cargar vendedores')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSellers() }, [fetchSellers])

  const handleCreated = (seller) => {
    setSellers(prev => [seller, ...prev])
  }

  const handleUpdated = (updated) => {
    setSellers(prev => prev.map(s => s.id === updated.id ? updated : s))
  }

  const handleDeactivate = async (seller) => {
    if (!window.confirm(`¿Desactivar al vendedor "${seller.name}"?`)) return
    try {
      const updated = await adminService.deactivateSeller(seller.id)
      setSellers(prev => prev.map(s => s.id === updated.id ? updated : s))
    } catch (err) {
      alert(err.message || 'Error al desactivar')
    }
  }

  const handleActivate = async (seller) => {
    try {
      const updated = await adminService.updateSeller(seller.id, { active: true })
      setSellers(prev => prev.map(s => s.id === updated.id ? updated : s))
    } catch (err) {
      alert(err.message || 'Error al activar')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Vendedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {sellers.length} vendedor{sellers.length !== 1 ? 'es' : ''} registrado{sellers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm
                     font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          <span>➕</span> Agregar vendedor
        </button>
      </div>

      {/* Estado de carga / error */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchSellers}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700">
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {sellers.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-3">👤</p>
              <p className="font-medium">No hay vendedores registrados</p>
              <p className="text-sm mt-1">Agrega el primer vendedor con el botón de arriba</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Nombre</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Estado</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Registro</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sellers.map(seller => (
                    <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-900">{seller.name}</td>
                      <td className="px-5 py-4 text-gray-500">{seller.email}</td>
                      <td className="px-5 py-4">
                        {seller.active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1
                                           rounded-full text-xs font-semibold
                                           bg-green-100 text-green-700">
                            ● Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1
                                           rounded-full text-xs font-semibold
                                           bg-red-100 text-red-600">
                            ● Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-400">
                        {new Date(seller.created_at).toLocaleDateString('es-PE', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <button
                            onClick={() => setEditSeller(seller)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg
                                       bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setResetSeller(seller)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg
                                       bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                          >
                            Resetear pwd
                          </button>
                          {seller.active ? (
                            <button
                              onClick={() => handleDeactivate(seller)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg
                                         bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            >
                              Desactivar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(seller)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg
                                         bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            >
                              Activar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {createOpen && (
        <CreateModal
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreated}
        />
      )}
      {editSeller && (
        <EditModal
          seller={editSeller}
          onClose={() => setEditSeller(null)}
          onUpdated={handleUpdated}
        />
      )}
      {resetSeller && (
        <ResetPasswordModal
          seller={resetSeller}
          onClose={() => setResetSeller(null)}
          onReset={() => {}}
        />
      )}
    </div>
  )
}
