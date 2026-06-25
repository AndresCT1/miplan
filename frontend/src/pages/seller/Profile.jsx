import { useState, useEffect, useCallback } from 'react'
import { sellerService } from '../../services/api'

function EyeIcon({ visible }) {
  return visible ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
        className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm
                   focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        aria-label={show ? 'Ocultar' : 'Mostrar'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <EyeIcon visible={show} />
      </button>
    </div>
  )
}

export default function Profile() {
  const [profile,      setProfile]      = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [testing,      setTesting]      = useState(false)
  const [error,        setError]        = useState(null)
  const [success,      setSuccess]      = useState('')
  const [showApiKey,   setShowApiKey]   = useState(false)
  const [form,         setForm]         = useState({ phone: '', callmebot_apikey: '' })

  // J — Change password
  const [pwForm,   setPwForm]   = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwError,  setPwError]  = useState('')
  const [pwSuccess,setPwSuccess]= useState('')
  const [pwSaving, setPwSaving] = useState(false)

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const data = await sellerService.getProfile()
      setProfile(data)
      setForm({ phone: data.phone ?? '', callmebot_apikey: data.callmebot_apikey ?? '' })
    } catch (err) {
      setError(err.message || 'Error al cargar perfil')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError(null); setSuccess('')
    try {
      const updated = await sellerService.updateProfile({
        phone:            form.phone || undefined,
        callmebot_apikey: form.callmebot_apikey || undefined,
      })
      setProfile(updated)
      setSuccess('Perfil actualizado correctamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true); setError(null); setSuccess('')
    try {
      await sellerService.testNotification()
      setSuccess('✅ Mensaje de prueba enviado a tu WhatsApp')
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err.message || 'No se pudo enviar el mensaje de prueba')
    } finally {
      setTesting(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwError(''); setPwSuccess('')
    const { currentPassword, newPassword, confirm } = pwForm
    if (!currentPassword || !newPassword || !confirm) {
      setPwError('Completa todos los campos'); return
    }
    if (newPassword.length < 6) {
      setPwError('La nueva contraseña debe tener mínimo 6 caracteres'); return
    }
    if (newPassword === currentPassword) {
      setPwError('La nueva contraseña debe ser diferente a la actual'); return
    }
    if (newPassword !== confirm) {
      setPwError('Las contraseñas no coinciden'); return
    }
    setPwSaving(true)
    try {
      await sellerService.changePassword({ currentPassword, newPassword })
      setPwSuccess('✅ Contraseña cambiada correctamente')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
      setTimeout(() => setPwSuccess(''), 5000)
    } catch (err) {
      setPwError(err.message || 'Error al cambiar la contraseña')
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Mi Perfil</h1>

      {/* Info de cuenta (solo lectura) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Cuenta</h2>
        <div>
          <p className="text-xs text-gray-400">Nombre</p>
          <p className="font-medium text-gray-900">{profile?.name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Email</p>
          <p className="font-medium text-gray-900">{profile?.email}</p>
        </div>
        <p className="text-xs text-gray-400 italic">Para cambiar nombre o email, contacta al administrador.</p>
      </div>

      {/* Notificaciones WhatsApp */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Notificaciones WhatsApp</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tu número WhatsApp</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="9XXXXXXXX"
            maxLength={9}
            inputMode="numeric"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-400 mt-1">9 dígitos, sin código de país</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CallMeBot API Key</label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={form.callmebot_apikey}
              onChange={e => setForm(f => ({ ...f, callmebot_apikey: e.target.value }))}
              placeholder="Tu API key de CallMeBot"
              className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <EyeIcon visible={showApiKey} />
            </button>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-800">¿Cómo obtener tu API Key?</p>
          <ol className="text-xs text-blue-700 space-y-1.5 list-none">
            <li>1. Agrega <strong>+34 694 242 562</strong> a tus contactos de WhatsApp</li>
            <li>2. Envíale exactamente: <code className="bg-blue-100 px-1 rounded">I allow callmebot to send me messages</code></li>
            <li>3. Recibirás un mensaje con tu API Key</li>
            <li>4. Pega la API Key aquí y presiona Guardar</li>
          </ol>
        </div>

        {error   && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm font-medium">{success}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando...</> : 'Guardar'}
          </button>
          {profile?.callmebot_apikey && profile?.phone && (
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {testing ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enviando...</> : '🧪 Probar'}
            </button>
          )}
        </div>
      </form>

      {/* J — Cambiar contraseña */}
      <form onSubmit={handleChangePassword}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
          🔒 Cambiar contraseña
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
          <PasswordInput
            value={pwForm.currentPassword}
            onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
            placeholder="Tu contraseña actual"
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
          <PasswordInput
            value={pwForm.newPassword}
            onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
          <PasswordInput
            value={pwForm.confirm}
            onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
            placeholder="Repite la nueva contraseña"
            autoComplete="new-password"
          />
        </div>

        {pwError   && <p className="text-red-600 text-sm">{pwError}</p>}
        {pwSuccess && <p className="text-green-600 text-sm font-medium">{pwSuccess}</p>}

        <button
          type="submit"
          disabled={pwSaving}
          className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold
                     text-sm rounded-xl transition-colors disabled:opacity-50
                     flex items-center justify-center gap-2"
        >
          {pwSaving
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Cambiando...</>
            : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  )
}
