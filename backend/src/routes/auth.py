from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import Session

from ..database import models, db
from ..authentication.jwt import hash_password, authenticate_user, create_token

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class AuthOut(BaseModel):
    access_token: str
    user_id: int
    email: EmailStr

#register user by email and password
@router.post("/register", response_model=AuthOut)
def register(body: RegisterIn, session: Session = Depends(db.get_db)):
    #check if email is already registered
    exists = session.query(models.User).filter(models.User.email == body.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    #hash and create user
    hashed = hash_password(body.password)
    user = models.User(email=body.email, password=hashed, full_name=body.full_name)
    session.add(user)
    session.commit()
    session.refresh(user)
    #create token for user
    token = create_token(user.id, user.email)
    return {"access_token": token, "user_id": user.id, "email": user.email}
    
@router.post("/login", response_model=AuthOut)
#login user by email and password
def login(body: LoginIn, session: Session = Depends(db.get_db)):
    user = authenticate_user(session, body.email, body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user.id, user.email)
    return {"access_token": token, "user_id": user.id, "email": user.email}
