from typing import List, Dict
from openai import OpenAI
from .base import BaseLLMProvider
from app import config

class OpenAIProvider(BaseLLMProvider):
    def __init__(self):
        if not config.OPENAI_API_KEY:
            raise RuntimeError("Falta OPENAI_API_KEY en el .env del backend")
        self.client = OpenAI(api_key=config.OPENAI_API_KEY)
        self.model = config.OPENAI_MODEL

    def generate(self, messages: List[Dict[str, str]]) -> str:
        resp = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.3,
        )
        return resp.choices[0].message.content or ""
