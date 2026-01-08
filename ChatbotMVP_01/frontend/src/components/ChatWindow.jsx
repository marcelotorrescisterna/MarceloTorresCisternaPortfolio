import { useEffect, useMemo, useRef, useState } from "react";
import { sendChatMessage } from "../api/chatApi";
import { getOrCreateSessionId } from "../utils/session";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import styles from "./ChatWindow.module.css";

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hola 👋 Soy el asistente de la clínica. Puedo ayudarte con horarios, ubicación y valores referenciales.",
      time: nowHHMM(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  const sessionId = useMemo(() => getOrCreateSessionId(), []);
  const bottomRef = useRef(null);

  // Scroll automático
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTyping]);

  async function onSend() {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg = {
      role: "user",
      content: text,
      time: nowHHMM(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    // Fix 1: limitar historial enviado al LLM
    const MAX_HISTORY_FOR_LLM = 20;

    // Historial sin timestamps para backend (últimos N)
    const history = [...messages, userMsg]
      .slice(-MAX_HISTORY_FOR_LLM)
      .map(({ role, content }) => ({
        role,
        content,
      }));

    // Delay para mostrar "escribiendo…" solo si demora
    let typingTimer = setTimeout(() => {
      setShowTyping(true);
    }, 250);

    try {
      const data = await sendChatMessage({
        session_id: sessionId,
        message: text,
        history,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.assistant_message ?? "(sin respuesta)",
          time: nowHHMM(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Ups, ocurrió un error al contactar el servidor. Intenta nuevamente.",
          time: nowHHMM(),
        },
      ]);
    } finally {
      clearTimeout(typingTimer);
      setShowTyping(false);
      setIsSending(false);
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
        <div className={styles.title}>Datellus • Chatbot Clínica</div>
        <div className={styles.session}>
          Sesión {sessionId.slice(0, 8)}…
        </div>
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
          placeholder="Escribe tu mensaje… (Enter para enviar)"
          disabled={isSending}
          className={styles.input}
          rows={2}
        />

        <button
          onClick={onSend}
          disabled={isSending || !input.trim()}
          className={styles.button}
        >
          Enviar
        </button>
      </footer>
    </div>
  );
}
