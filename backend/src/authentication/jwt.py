import os
from datetime import datetime, timedelta, timezone
import jwt
from passlib.context import CryptContext
from ..database import models
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
EXPIRE_MINUTES = 60 * 24 * 30  # 30 days
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
def hash_password(password: str):
    return pwd.hash(password)

def check_password(plain: str, hashed: str):
    return pwd.verify(plain, hashed)
#create token for user
def create_token(user_id: int, email: str):
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
#decode token to get user id and email
def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        return None
#authenticate user by email and password
def authenticate_user(db, email: str, password: str | None = None):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not check_password(password, user.password):
        return None
    return user
