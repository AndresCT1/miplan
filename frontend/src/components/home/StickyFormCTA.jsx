import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat as useChatContext } from '../../context/ChatContext'
import { useCompare } from '../../context/CompareContext'

const STORAGE_KEY = 'sticky_cta_dismissed'

export default function StickyFormCTA() {
  const navigate              = useNavigate()
  const { isOpen: chatOpen }  = useChatContext()
  const { selectedPlans }     = useCompare()

  const [scrolled,   setScrolled]   = useState(false)
  const [dismissed,  setDismissed]  = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === '1'
  )

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1')
    setDismissed(true)
  }

  // Ocultar si: ya cerrado, no scrolleado, chat abierto, compare bar activa
  if (dismissed || !scrolled || chatOpen || selectedPlans.length > 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200
                    shadow-lg transition-transform duration-300">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

        <p className="text-sm font-medium text-gray-700 truncate">
          ¿Ya elegiste tu plan?{' '}
          <span className="text-gray-500 hidden sm:inline">
            Un asesor te llama hoy gratis.
          </span>
        </p>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate('/contacto')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white
                       text-sm font-semibold rounded-xl min-h-[40px]
                       transition-colors whitespace-nowrap"
          >
            Quiero que me llamen
          </button>

          <button
            onClick={handleDismiss}
            aria-label="Cerrar"
            className="w-9 h-9 flex items-center justify-center rounded-lg
                       text-gray-400 hover:text-gray-700 hover:bg-gray-100
                       transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
