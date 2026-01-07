from typing import List, Dict
from app.providers.base import BaseLLMProvider

class BedrockProvider(BaseLLMProvider):
    def __init__(self):
        raise NotImplementedError(
            "BedrockProvider aún no implementado. "
            "Cambia LLM_PROVIDER=openai o implementamos Bedrock en la siguiente etapa."
        )

    def generate(self, messages: List[Dict[str, str]]) -> str:
        raise NotImplementedError
