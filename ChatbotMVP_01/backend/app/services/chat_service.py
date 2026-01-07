from typing import List, Dict, Optional
from app.providers.base import BaseLLMProvider

SYSTEM_PROMPT = """Eres un asistente de atención al cliente de una clínica.
Reglas:
- Responde en español (Chile), tono amable y claro.
- No entregues diagnósticos médicos. Si piden diagnóstico, sugiere agendar hora con un profesional.
- Si es urgencia, indica acudir a urgencias o llamar a emergencias.
"""

def build_messages(user_message: str, history: Optional[List[Dict[str, str]]] = None) -> List[Dict[str, str]]:
    msgs: List[Dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history:
        msgs.extend(history[-20:])
    msgs.append({"role": "user", "content": user_message})
    return msgs

def run_chat(provider: BaseLLMProvider, user_message: str, history: Optional[List[Dict[str, str]]] = None) -> str:
    messages = build_messages(user_message=user_message, history=history)
    return (provider.generate(messages) or "").strip()
