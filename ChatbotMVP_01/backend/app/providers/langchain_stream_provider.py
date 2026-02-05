import json
from typing import Dict, List, Iterator

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app import config


class LangChainStreamProvider:
    def __init__(self) -> None:
        if not config.OPENAI_API_KEY:
            raise RuntimeError("Falta OPENAI_API_KEY en el .env del backend")

        self.model = config.OPENAI_MODEL
        self.client = ChatOpenAI(
            api_key=config.OPENAI_API_KEY,
            model=self.model,
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
