from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional

from ..database import models, db
from ..authentication.jwt import decode_token

router = APIRouter(prefix="/profile", tags=["profile"])

class ProfileUpdateIn(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None

class ProfileOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None


def get_current_user(authorization: str = Header(...), session: Session = Depends(db.get_db)):
    try:
        # remove 'Bearer ' prefix if present, this line is written by cursor to fix the bug
        token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
        
        payload = decode_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        # get user id from token
        user_id = int(payload.get("sub"))
        user = session.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/me", response_model=ProfileOut)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name
    }

@router.patch("/me", response_model=ProfileOut)
def update_profile(
    profile_data: ProfileUpdateIn,
    current_user: models.User = Depends(get_current_user),
    session: Session = Depends(db.get_db)
):
    # update fields
    if profile_data.email is not None:
        current_user.email = profile_data.email
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    session.commit()
    session.refresh(current_user)
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name
    }
