const API_URL = import.meta.env.VITE_API_URL;

export async function sendChatMessage({ session_id, message, history }) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id, message, history }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || "No details"}`);
  }

  return res.json(); // { session_id, assistant_message, ... }
}
