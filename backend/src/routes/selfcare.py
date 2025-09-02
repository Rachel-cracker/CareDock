from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database.db import get_db
from ..database import models

router = APIRouter()

#get all selfcare files
@router.get("/selfcare/files")
def get_all_selfcare_files(db: Session = Depends(get_db)):
    return db.query(models.Selfcare_File).all()

