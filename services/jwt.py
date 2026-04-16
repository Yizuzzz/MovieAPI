import os
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database.database import get_db
from database.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 20)))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, os.getenv("SECRET_KEY"), algorithm=os.getenv("ALGORITHM"))

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])
        user_id: int = payload.get("user_id")
        current_user = db.query(User).filter(User.id == user_id).first()
        if current_user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return current_user
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")