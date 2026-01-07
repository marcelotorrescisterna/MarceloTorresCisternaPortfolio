from pydantic import BaseModel, Field
from typing import Literal, List, Optional

Role = Literal["system", "user", "assistant"]

class ChatMessage(BaseModel):
    role: Role
    content: str = Field(min_length=1, max_length=8000)

class ChatRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=128)
    message: str = Field(min_length=1, max_length=8000)
    history: Optional[List[ChatMessage]] = None

class ChatResponse(BaseModel):
    session_id: str
    assistant_message: str
