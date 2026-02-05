import json
from typing import Dict, List, Iterator

from app import config

try:
    from langchain_community.chat_models import ChatOllama
except ImportError as exc:
    raise RuntimeError(
        "Falta instalar langchain-community. "
        "Ejecuta: pip install langchain-community"
    ) from exc

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage


class OllamaStreamProvider:
    def __init__(self) -> None:
        self.model = config.OLLAMA_MODEL
        self.base_url = config.OLLAMA_BASE_URL

        self.client = ChatOllama(
            model=self.model,
            base_url=self.base_url,
            temperature=0.3,
            streaming=True,
        )

    def _to_lc_messages(self, messages: List[Dict[str, str]]):
        lc_messages = []
        for message in messages:
            role = message.get("role")
            content = message.get("content", "")

            if role == "system":
                lc_messages.append(SystemMessage(content=content))
            elif role == "user":
                lc_messages.append(HumanMessage(content=content))
            elif role == "assistant":
                lc_messages.append(AIMessage(content=content))
            else:
                lc_messages.append(HumanMessage(content=content))

        return lc_messages

    def stream(self, messages: List[Dict[str, str]]) -> Iterator[str]:
        lc_messages = self._to_lc_messages(messages)

        for chunk in self.client.stream(lc_messages):
            delta = chunk.content
            if isinstance(delta, str) and delta:
                payload = json.dumps({"delta": delta}, ensure_ascii=False)
                yield f"data: {payload}\n\n"

        yield "data: {\"done\": true}\n\n"
