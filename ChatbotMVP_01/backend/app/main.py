from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app import config
from app.schemas import ChatRequest
from app.services.chat_service import build_messages  # usamos tu lógica existente
from app.providers.openai_stream_provider import OpenAIStreamProvider

app = FastAPI(title="Datellus Chat Backend (Streaming)", version="0.1.0-stream")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

provider = OpenAIStreamProvider()

@app.get("/health")
def health():
    return {"status": "ok", "provider": "openai-stream"}

@app.post("/chat/stream")
def chat_stream(req: ChatRequest):
    try:
        history = [m.model_dump() for m in (req.history or [])]
        messages = build_messages(user_message=req.message, history=history)

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
