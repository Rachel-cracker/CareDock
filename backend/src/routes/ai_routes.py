from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..ai import generate_response, generate_resource_response, ai_suggest_task_fields

router = APIRouter()

class ChatIn(BaseModel):
    message: str
class ChatOut(BaseModel):
    reply: str

@router.post("/support/chat", response_model=ChatOut)
def support_chat(body: ChatIn):
    try:
        return {"reply": generate_response(body.message)}
    except Exception:
        raise HTTPException(status_code=502, detail="AI service error")

class RCIn(BaseModel):
    question: str
class RCOut(BaseModel):
    summary: str

@router.post("/resource/ai-summary", response_model=RCOut)
def resource_ai_summary(body: RCIn):
    try:
        return {"summary": generate_resource_response(body.question)}
    except Exception:
        raise HTTPException(status_code=502, detail="AI service error")

class AssistIn(BaseModel):
    text: str
class AssistOut(BaseModel):
    title: str
    date: str
    time: str
    duration: int
    priority: str
    category: str
    notes: str

@router.post("/tasks/ai-assist", response_model=AssistOut)
def tasks_ai_assist(body: AssistIn):
    try:
        return ai_suggest_task_fields(body.text)
    except Exception:
        raise HTTPException(status_code=502, detail="AI service error")
