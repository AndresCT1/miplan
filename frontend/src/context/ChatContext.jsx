import { createContext, useContext, useState } from 'react'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([])
  const [isOpen, setIsOpen]     = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = (role, content) =>
    setMessages((prev) => [...prev, { role, content, id: Date.now() }])

  return (
    <ChatContext.Provider value={{ messages, isOpen, isLoading, setIsOpen, setIsLoading, addMessage }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
