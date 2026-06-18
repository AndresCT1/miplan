import { useCallback } from 'react'
import { useChat as useChatContext } from '../context/ChatContext'
import { chatService } from '../services/api'

export function useChat() {
  const { messages, isOpen, isLoading, setIsOpen, setIsLoading, addMessage } = useChatContext()

  const sendMessage = useCallback(async (text) => {
    const trimmed = text?.trim()
    if (!trimmed || isLoading) return null

    addMessage('user', trimmed)
    setIsLoading(true)

    try {
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }))

      const result = await chatService.sendMessage(trimmed, history)
      addMessage('assistant', result.response)
      return result
    } catch {
      addMessage('assistant', 'Lo siento, tuve un problema. ¿Te conecto con un asesor?')
      return { response: '', action: 'OPEN_FORM', actionData: null, source: 'error' }
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, addMessage, setIsLoading])

  return { messages, isOpen, isLoading, setIsOpen, sendMessage }
}
