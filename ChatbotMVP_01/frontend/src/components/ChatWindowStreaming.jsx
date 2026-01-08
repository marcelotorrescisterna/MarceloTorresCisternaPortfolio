import { useEffect, useMemo, useRef, useState } from "react";
import { getOrCreateSessionId } from "../utils/session";
import { streamChatMessage } from "../api/chatAPIStream";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import styles from "./ChatWindow.module.css";

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function ChatWindowStreaming() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hola 👋 Soy el asistente de la clínica. (Versión streaming) ¿En qué te ayudo?",
      time: nowHHMM(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  const sessionId = useMemo(() => getOrCreateSessionId(), []);
  const bottomRef = useRef(null);

  // --- Streaming speed control (frontend throttling) ---
  const renderQueueRef = useRef("");
  const renderTimerRef = useRef(null);

  // Ajusta estos 2 para controlar la “velocidad”
  const CHARS_PER_TICK = 6; // más bajo = más lento
  const MS_PER_TICK = 100; // más alto = más lento

  function startRenderLoop() {
    if (renderTimerRef.current) return;

    renderTimerRef.current = setInterval(() => {
      const pending = renderQueueRef.current;
      if (!pending) return;

      const toAppend = pending.slice(0, CHARS_PER_TICK);
      renderQueueRef.current = pending.slice(CHARS_PER_TICK);

      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant") {
          copy[copy.length - 1] = { ...last, content: (last.content || "") + toAppend };
        }
        return copy;
      });
    }, MS_PER_TICK);
  }

  function stopRenderLoop() {
    if (renderTimerRef.current) {
      clearInterval(renderTimerRef.current);
      renderTimerRef.current = null;
    }
    renderQueueRef.current = "";
  }

  // Scroll automático
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTyping]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => stopRenderLoop();
  }, []);

  async function onSend() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg = { role: "user", content: text, time: nowHHMM() };

    // Creamos placeholder del assistant para ir concatenando deltas
    const assistantPlaceholder = { role: "assistant", content: "", time: nowHHMM() };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setInput("");
    setIsStreaming(true);

    // Fix 1: limitar historial enviado al LLM
    const MAX_HISTORY_FOR_LLM = 20;

    const history = [...messages, userMsg]
      .slice(-MAX_HISTORY_FOR_LLM)
      .map(({ role, content }) => ({ role, content }));

    // Delay para mostrar “escribiendo…” solo si demora
    let typingTimer = setTimeout(() => setShowTyping(true), 200);

    try {
      await streamChatMessage({
        session_id: sessionId,
        message: text,
        history,
        onDelta: (delta) => {
          // Al primer delta: apagamos typing y empezamos a renderizar “con velocidad”
          clearTimeout(typingTimer);
          setShowTyping(false);

          // Encolamos el texto que llega
          renderQueueRef.current += delta;

          // Aseguramos que el loop está activo
          startRenderLoop();
        },
      });

      // Al terminar: “drena” lo pendiente rápido para no quedar cortado
      if (renderQueueRef.current) {
        const remaining = renderQueueRef.current;
        renderQueueRef.current = "";
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            copy[copy.length - 1] = { ...last, content: (last.content || "") + remaining };
          }
          return copy;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant") {
          copy[copy.length - 1] = {
            ...last,
            content:
              "Ups, falló el streaming. Revisa backend/puerto/CORS.\n\nDetalle: " +
              (err?.message || "desconocido"),
          };
        }
        return copy;
      });
    } finally {
      clearTimeout(typingTimer);
      setShowTyping(false);
      setIsStreaming(false);
      stopRenderLoop();
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.title}>Datellus • Chatbot Clínica (Streaming)</div>
        <div className={styles.session}>Sesión {sessionId.slice(0, 8)}…</div>
      </header>

      <main className={styles.chat}>
        {messages.map((m, i) => (
          <MessageBubble key={i} {...m} />
        ))}

        {showTyping && <TypingIndicator />}

        <div ref={bottomRef} />
      </main>

      <footer className={styles.footer}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escribe tu mensaje… (Enter para enviar, Shift+Enter salto de línea)"
          disabled={isStreaming}
          className={styles.input}
          rows={2}
        />

        <button onClick={onSend} disabled={isStreaming || !input.trim()} className={styles.button}>
          Enviar
        </button>
      </footer>
    </div>
  );
}
