from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database.database import get_db
from schemas.user import UserCreate, UserResponse
from database import User
from services.jwt import create_access_token
from services.security import hash_password, verify_password

router = APIRouter(prefix="/auth")
@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.email == user.email) | (User.username == user.username)
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email or username already registered")
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user_db = db.query(User).filter(User.username == form_data.username).first()
    if not user_db:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    if not verify_password(form_data.password, user_db.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    access_token = create_access_token(data={"user_id": user_db.id})
    return {
            "access_token": access_token,
            "token_type": "bearer"
    }