const API_URL = import.meta.env.VITE_API_URL;

export async function streamChatMessage({ session_id, message, history, onDelta }) {
  const res = await fetch(`${API_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id, message, history }),
  });

  console.log("================== SENDING REQUEST TO ===================")
  console.log(`${API_URL}/chat/stream`)

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || "No details"}`);
  }

  // SSE parse (data: {...}\n\n)
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE events terminan con \n\n
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);

      // buscamos líneas data:
      const lines = rawEvent.split("\n");
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const dataStr = line.slice(5).trim();
        if (!dataStr) continue;

        const payload = JSON.parse(dataStr);
        if (payload.done) return;

        if (payload.delta) onDelta(payload.delta);
      }
    }
  }
}
