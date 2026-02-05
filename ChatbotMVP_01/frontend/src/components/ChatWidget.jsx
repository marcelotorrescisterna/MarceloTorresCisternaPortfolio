import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './ChatWidget.module.css'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import { getOrCreateSessionId } from '../utils/session'
import { streamChatMessage } from '../api/chatApiStream'

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      'Hola, soy Atlas. Estoy aqui para ayudarte como si fueras atendido por una persona real, con un estilo cercano y actual. Puedo ayudarte a agendar, informar precios o derivar a un especialista. Como puedo ayudarte hoy?',
  },
]

function ChatWidget({ isOpen, setIsOpen }) {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  const bottomRef = useRef(null)
  const renderQueueRef = useRef('')
  const renderTimerRef = useRef(null)
  const sessionId = useMemo(() => getOrCreateSessionId(), [])

  const startRenderLoop = (assistantId) => {
    if (renderTimerRef.current) return

    renderTimerRef.current = setInterval(() => {
      const pending = renderQueueRef.current
      if (!pending) return

      const chunk = pending.slice(0, 6)
      renderQueueRef.current = pending.slice(6)

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: `${msg.content || ''}${chunk}` }
            : msg
        )
      )
    }, 45)
  }

  const stopRenderLoop = () => {
    if (renderTimerRef.current) {
      clearInterval(renderTimerRef.current)
      renderTimerRef.current = null
    }
    renderQueueRef.current = ''
  }

  const sendMessage = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    }
    const assistantId = `assistant-${Date.now() + 1}`

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: 'assistant', content: '' },
    ])
    setInput('')
    setIsStreaming(true)

    const history = [...messages, userMessage]
      .slice(-20)
      .map(({ role, content }) => ({ role, content }))

    let typingTimer = setTimeout(() => setShowTyping(true), 200)

    try {
      await streamChatMessage({
        session_id: sessionId,
        message: trimmed,
        history,
        onDelta: (delta) => {
          clearTimeout(typingTimer)
          setShowTyping(false)

          renderQueueRef.current += delta
          startRenderLoop(assistantId)
        },
      })

      if (renderQueueRef.current) {
        const remaining = renderQueueRef.current
        renderQueueRef.current = ''
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: `${msg.content || ''}${remaining}` }
              : msg
          )
        )
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content:
                  'Ups, fallo el streaming. Revisa backend, puerto y CORS. Detalle: ' +
                  (err?.message || 'desconocido'),
              }
            : msg
        )
      )
    } finally {
      clearTimeout(typingTimer)
      setShowTyping(false)
      setIsStreaming(false)
      stopRenderLoop()
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showTyping])

  useEffect(() => {
    return () => stopRenderLoop()
  }, [])

  return (
    <div className={styles.wrapper}>
      {isOpen ? (
        <div className={styles.panel}>
          <header className={styles.header}>
            <div>
              <p className={styles.title}>Atlas</p>
              <p className={styles.subtitle}>En linea - Respuesta inmediata</p>
            </div>
            <button className={styles.close} onClick={() => setIsOpen(false)}>
              Cerrar
            </button>
          </header>

          <div className={styles.messages}>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {showTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          <form
            className={styles.inputRow}
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage(input)
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribe tu mensaje..."
              type="text"
              disabled={isStreaming}
            />
            <button type="submit" disabled={isStreaming || !input.trim()}>
              Enviar
            </button>
          </form>
        </div>
      ) : (
        <button className={styles.fab} onClick={() => setIsOpen(true)}>
          Hablar con el asistente
        </button>
      )}
    </div>
  )
}

export default ChatWidget
