from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from dotenv import load_dotenv
import jwt
import bcrypt
from datetime import datetime, timedelta
import os
from database import get_db_connection
load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str
    email: str


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


@router.post("/register")
async def register(req: RegisterRequest)-> dict:
    async with get_db_connection() as conn:
        existing = await conn.fetchrow(
            "SELECT id FROM users WHERE username = $1 OR email = $2",
            req.username, req.email
        )
        if existing:
            raise HTTPException(status_code=400, detail="Username or email already exists")

        hashed = hash_password(req.password)
        await conn.execute(
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)",
            req.username, req.email, hashed
        )
    return {"message": "User registered successfully"}


@router.post("/login")
async def login(req: LoginRequest):
    async with get_db_connection() as conn:
        user = await conn.fetchrow(
            "SELECT id, username, password_hash FROM users WHERE username = $1",
            req.username
        )

    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = create_access_token({"sub": str(user["id"]), "username": user["username"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user["username"]
    }


@router.post("/demo-login")
async def demo_login():
    """Demo endpoint — no DB needed for quick testing."""
    token = create_access_token({"sub": "demo-user", "username": "demo"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": "demo"
    }
