import json
from typing import Dict, List, Iterator
from openai import OpenAI
from app import config

class OpenAIStreamProvider:
    def __init__(self):
        if not config.OPENAI_API_KEY:
            raise RuntimeError("Falta OPENAI_API_KEY en el .env del backend")
        self.client = OpenAI(api_key=config.OPENAI_API_KEY)
        self.model = config.OPENAI_MODEL

    def stream(self, messages: List[Dict[str, str]]) -> Iterator[str]:
        """
        Retorna un iterator de eventos SSE (texto ya formateado).
        """
        stream = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.3,
            stream=True,
        )

        for event in stream:
            delta = event.choices[0].delta.content
            if delta:
                payload = json.dumps({"delta": delta}, ensure_ascii=False)
                yield f"data: {payload}\n\n"

        yield "data: {\"done\": true}\n\n"
