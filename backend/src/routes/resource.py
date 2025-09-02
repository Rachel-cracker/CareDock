# backend/src/routes/resource.py
from fastapi import APIRouter, Depends, Query, Body
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
import os, mimetypes

from ..database.db import get_db
from ..database import models
from ..ai import generate_resource_response

router = APIRouter()

# ai summarization
@router.post("/resource/ai-summary")
def ai_summary(body: dict = Body(...)):
    question = (body.get("question") or "").strip()
    if not question:
        return {"error": "question is required"}
    return {"summary": generate_resource_response(question)}

#download files
@router.get("/resource/files/{file_id}/download")
def download_file(file_id: int, db: Session = Depends(get_db)):
    rf = db.query(models.Resource_File).filter(models.Resource_File.id == file_id).first()
    if not rf:
        return {"error": "File not found"}
    path = rf.file_path
    return FileResponse(rf.file_path, filename=rf.file_name)


