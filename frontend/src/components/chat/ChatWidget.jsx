import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat }    from '../../hooks/useChat'
import { useCompare } from '../../context/CompareContext'

const WA_URL = 'https://wa.me/51920170692'

// Guarda datos del chat en sessionStorage para pre-llenar el form de contacto
function saveChatDataToSession(phone, name) {
  if (phone) sessionStorage.setItem('chatPhone', phone)
  if (name && name !== 'Cliente Chat') sessionStorage.setItem('chatName', name)
}

// Extrae el celular de los mensajes del chat (client-side)
function extractPhoneFromMessages(messages) {
  for (const msg of [...messages].reverse()) {
    if (msg.role !== 'user') continue
    const m = msg.content?.match(/\b9\d{8}\b/)
    if (m) return m[0]
  }
  return null
}

const WELCOME_MSG = {
  role: 'welcome',
  content: '¡Hola! 👋 Soy el asesor virtual de MiPlan.pe\nTe ayudo a encontrar el mejor plan de internet para tu hogar en Arequipa en menos de 2 minutos.\n\n¿Qué es más importante para ti?',
  id: 0,
  ts: Date.now(),
}

const QUICK_REPLIES = [
  { label: '💰 El precio',      text: 'Quiero saber los precios y cuánto cuesta' },
  { label: '⚡ La velocidad',   text: 'Quiero saber qué velocidad necesito' },
  { label: '📺 Internet + TV',  text: 'Quiero internet con televisión y canales' },
  { label: '🤷 No sé, ayúdame', text: 'No sé qué plan elegir, cuéntame las opciones' },
]

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

function TypingDots() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs flex-shrink-0">
        🤖
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ msg }) {
  const isBot = msg.role !== 'user'
  return (
    <div className={`flex items-end gap-2 mb-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs flex-shrink-0">
          🤖
        </div>
      )}
      <div className={`max-w-[78%] ${isBot ? '' : 'items-end flex flex-col'}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
            isBot
              ? 'bg-gray-100 text-gray-800 rounded-bl-sm'
              : 'bg-blue-600 text-white rounded-br-sm'
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1">
          {formatTime(msg.ts)}
        </span>
      </div>
    </div>
  )
}

function LeadSuccessCard() {
  return (
    <div className="mt-1 mb-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
      <p className="text-sm font-extrabold text-green-700 mb-0.5">✅ ¡Registro exitoso!</p>
      <p className="text-xs text-green-600 mb-3">Te llamamos en menos de 2 horas</p>
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5
                   bg-green-500 hover:bg-green-600 text-white text-xs
                   font-semibold rounded-xl transition-colors"
      >
        💬 WhatsApp mientras tanto
      </a>
    </div>
  )
}

export default function ChatWidget() {
  const navigate  = useNavigate()
  const { messages, isOpen, isLoading, inputDisabled, setIsOpen, sendMessage } = useChat()
  const { selectedPlans } = useCompare()
  const hasBar    = selectedPlans.length > 0

  const [input, setInput]           = useState('')
  const [hasUnread, setHasUnread]   = useState(true)
  const [lastAction, setLastAction] = useState(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)
  const prevLenRef     = useRef(0)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, lastAction])

  useEffect(() => {
    if (!isOpen && messages.length > prevLenRef.current) {
      const last = messages[messages.length - 1]
      if (last?.role === 'assistant') setHasUnread(true)
    }
    prevLenRef.current = messages.length
  }, [messages, isOpen])

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  const handleSend = useCallback(async (text) => {
    const msg = text ?? input
    if (!msg.trim() || isLoading || inputDisabled) return
    setInput('')
    setShowWelcome(false)
    setLastAction(null)

    const result = await sendMessage(msg)
    if (!result) return

    if (result.action === 'SHOW_OPERATOR' && result.actionData?.slug) {
      navigate(`/operador/${result.actionData.slug}`)
      setIsOpen(false)
    } else if (result.action === 'SAVE_LEAD') {
      // Guardar phone (y nombre si el backend lo devolvió) para pre-llenar contacto
      saveChatDataToSession(result.actionData?.phone, result.actionData?.name)
      setLastAction('SAVE_LEAD')
    } else if (result.action) {
      setLastAction(result.action)
    }
  }, [input, isLoading, inputDisabled, sendMessage, navigate, setIsOpen])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const allMessages = showWelcome && messages.length === 0
    ? [WELCOME_MSG]
    : showWelcome
      ? [WELCOME_MSG, ...messages]
      : messages

  const isInputLocked = isLoading || inputDisabled

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Cerrar asesor virtual' : 'Abrir asesor virtual'}
        className={`fixed right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700
                    rounded-full flex items-center justify-center shadow-lg shadow-blue-300/40
                    transition-all duration-200 hover:scale-110 active:scale-95
                    ${hasBar ? 'bottom-[168px]' : 'bottom-24'}`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs
                           font-bold rounded-full flex items-center justify-center">
            1
          </span>
        )}
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div className={`fixed right-6 z-50 w-[360px] h-[520px] rounded-2xl shadow-2xl
                        bg-white flex flex-col overflow-hidden
                        animate-in slide-in-from-bottom-4 fade-in duration-200
                        ${hasBar ? 'bottom-[236px]' : 'bottom-40'}`}>

          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
              🤖
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">Asesor Virtual MiPlan</p>
              <p className="text-blue-200 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                En línea
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1"
              aria-label="Cerrar chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {allMessages.map((msg) => (
              <ChatBubble key={msg.id} msg={msg} />
            ))}

            {/* Quick replies bajo bienvenida */}
            {showWelcome && messages.length === 0 && (
              <div className="flex flex-wrap gap-2 mt-1 mb-3">
                {QUICK_REPLIES.map(({ label, text }) => (
                  <button
                    key={label}
                    onClick={() => handleSend(text)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700
                               text-xs font-medium rounded-full border border-blue-200
                               transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Acciones del backend */}
            {lastAction === 'SHOW_PLANS' && (
              <div className="flex flex-wrap gap-2 mt-1 mb-3">
                {[
                  { label: 'Claro',    text: 'claro' },
                  { label: 'Movistar', text: 'movistar' },
                  { label: 'WOW',      text: 'wow' },
                  { label: 'WIN',      text: 'win' },
                  { label: 'Mi Fibra', text: 'mi fibra' },
                ].map(({ label, text }) => (
                  <button
                    key={label}
                    onClick={() => handleSend(text)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700
                               text-xs font-medium rounded-full border border-blue-200
                               transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {lastAction === 'OPEN_FORM' && (
              <div className="mt-1 mb-3">
                <button
                  onClick={() => {
                    saveChatDataToSession(extractPhoneFromMessages(messages), null)
                    navigate('/contacto')
                    setIsOpen(false)
                  }}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white
                             text-sm font-semibold rounded-xl transition-colors"
                >
                  Hablar con un asesor →
                </button>
              </div>
            )}

            {lastAction === 'SHOW_OPTIONS' && (
              <div className="mt-1 mb-3 flex flex-col gap-2">
                <button
                  onClick={() => handleSend('Quiero ver todos los planes disponibles')}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white
                             text-sm font-semibold rounded-xl transition-colors"
                >
                  📋 Ver todos los planes
                </button>
                <button
                  onClick={() => {
                    saveChatDataToSession(extractPhoneFromMessages(messages), null)
                    navigate('/contacto')
                    setIsOpen(false)
                  }}
                  className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700
                             text-sm font-semibold rounded-xl transition-colors"
                >
                  💬 Hablar con un asesor
                </button>
              </div>
            )}

            {lastAction === 'SAVE_LEAD' && <LeadSuccessCard />}

            {isLoading && <TypingDots />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 px-3 py-3 flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={isInputLocked}
              placeholder={inputDisabled ? '✅ ¡Número registrado!' : 'Escribe tu consulta...'}
              maxLength={500}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm text-gray-800
                         placeholder-gray-400 border focus:outline-none
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-colors
                         ${isInputLocked
                           ? 'bg-green-50 border-green-200 cursor-not-allowed'
                           : 'bg-gray-50 border-gray-200'}`}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isInputLocked}
              aria-label="Enviar"
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40
                         text-white rounded-xl flex items-center justify-center
                         transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
