from typing import List, Dict, Optional

SYSTEM_PROMPT = """Eres un asistente de atencion al cliente de una clinica.
Reglas:
- Responde en espanol (Chile), tono amable y claro.
- No entregues diagnosticos medicos. Si piden diagnostico, sugiere agendar hora con un profesional.
- Si es urgencia, indica acudir a urgencias o llamar a emergencias.
"""


def build_messages(history: Optional[List[Dict[str, str]]] = None) -> List[Dict[str, str]]:
    msgs: List[Dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]

    if history:
        msgs.extend(history[-20:])

    return msgs
