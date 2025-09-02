from fastapi import APIRouter, Depends, HTTPException, Request, Response, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import models, db
from ..database.db import get_db
from datetime import date, time
import json
from typing import Literal, Optional

router = APIRouter()

@router.get("/tasks")
def get_tasks(
    request: Request,
    user_id: int = Query(...),
    db: Session = Depends(db.get_db)
):
    tasks = db.query(models.Task).filter(models.Task.user_id == user_id).all()
    return tasks

#schema for task, so that the data is validated before it is added to the database
#priority and status have to be one of the values in the list
Priority = Literal["high", "medium", "low"]
Status = Literal["pending", "in-progress", "completed"]

#request schema
class TaskCreate(BaseModel):
    title: str
    date: date
    time: time
    duration: int
    priority: Priority
    category: str
    notes: str = ""
    status: Status = "pending"
    completed: bool = False

#response schema
class TaskOut(BaseModel):
    id: int
    title: str
    date: date
    time: time
    duration: int
    priority: Priority
    category: str
    user_id: int
    notes: str
    status: Status
    completed: bool

# partial update schema
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[date] = None
    time: Optional[time] = None
    duration: Optional[int] = None
    priority: Optional[Priority] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[Status] = None
    completed: Optional[bool] = None

#convert the SQLAlchemy object to the Pydantic object so it can be sent as JSON
class Config:
        orm_mode = True

@router.post("/tasks", response_model=TaskOut)
def create_task(task: TaskCreate, user_id: int = Query(...), db: Session = Depends(db.get_db)):
    #create a Task row using all the fields from the schema plus user_id
    task_data = task.model_dump()
    task_data['user_id'] = user_id
    db_task = models.Task(**task_data)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.patch("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, patch: TaskUpdate, db: Session = Depends(db.get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        return {"error": "Task not found"}
    for k, v in patch.model_dump(exclude_unset=True).items():
        setattr(task, k, v)
    db.commit()
    db.refresh(task)
    return task

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(db.get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        return {"error": "Task not found"}
    db.delete(task)
    db.commit()
    return {"deleted": True}

