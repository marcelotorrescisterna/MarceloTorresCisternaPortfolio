from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app import config
from app.schemas import ChatRequest, ChatResponse
from app.providers.openai_provider import OpenAIProvider
from app.services.chat_service import run_chat

app = FastAPI(title="Datellus Chat Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

provider = OpenAIProvider()

@app.get("/health")
def health():
    return {"status": "ok", "provider": "openai"}

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        history = [m.model_dump() for m in (req.history or [])]
        assistant = run_chat(provider, req.message, history=history)
        if not assistant:
            assistant = "Pucha, no logré generar respuesta. ¿Me lo repites?"
        return ChatResponse(session_id=req.session_id, assistant_message=assistant)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
