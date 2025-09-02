from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from datetime import datetime, timedelta
from . import models

def get_db():
    db = models.SessionLocal()
    try:
        yield db
    finally:
        db.close() 

def create_user(db: Session, user: models.User):
    db_user = models.User(email=user.email, password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def add_task(db: Session, task: models.Task):
    db_task = models.Task(
        title=task.title,
        date=task.date,
        time=task.time,
        duration=task.duration,
        priority=task.priority,
        category=task.category,
        notes=task.notes,
        status=task.status or "pending",
        completed=task.completed 
        if task.completed is not None else False,
        user_id=task.user_id,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def edit_task(db: Session, task_id: int, task_update: models.Task):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        return None
    for field in [
        "title",
        "date",
        "time",
        "duration",
        "priority",
        "category",
        "notes",
        "status",
        "completed",
        "user_id",
    ]:
        if hasattr(task_update, field):
            value = getattr(task_update, field)
            if value is not None:
                setattr(db_task, field, value)
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        return False
    db.delete(db_task)
    db.commit()
    return True


