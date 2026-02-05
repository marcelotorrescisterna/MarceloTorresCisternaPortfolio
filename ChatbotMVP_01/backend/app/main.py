from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app import config
from app.schemas import ChatRequest
from app.services.chat_service import build_messages
from app.providers.langchain_stream_provider import LangChainStreamProvider
from app.providers.ollama_stream_provider import OllamaStreamProvider
from app.providers.bedrock_stream_provider import BedrockStreamProvider

_PROVIDER_NAME_MAP = {
    "langchain": "langchain-openai",
    "openai": "langchain-openai",
    "langchain-openai": "langchain-openai",
    "ollama": "langchain-ollama",
    "bedrock": "langchain-bedrock",
}


def _get_provider():
    provider_key = config.LLM_PROVIDER
    if provider_key in ("langchain", "openai", "langchain-openai"):
        return LangChainStreamProvider()
    if provider_key == "ollama":
        return OllamaStreamProvider()
    if provider_key == "bedrock":
        return BedrockStreamProvider()

    raise RuntimeError(
        f"LLM_PROVIDER no soportado: {provider_key}. "
        "Usa langchain/openai, ollama o bedrock."
    )


provider = _get_provider()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if config.LLM_PROVIDER == "ollama":
        try:
            # Best-effort warm-up to load the model into memory.
            for _ in provider.stream([{"role": "user", "content": "ping"}]):
                break
        except Exception:
            pass
    yield


app = FastAPI(
    title="Datellus Chat Backend (LangChain Streaming)",
    version="0.1.0-langchain",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    provider_name = _PROVIDER_NAME_MAP.get(config.LLM_PROVIDER, config.LLM_PROVIDER)
    return {"status": "ok", "provider": provider_name}


@app.post("/chat/stream")
def chat_stream(req: ChatRequest):
    try:
        history = [m.model_dump() for m in (req.history or [])]
        messages = build_messages(history=history)

        return StreamingResponse(
            provider.stream(messages),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
