import os
import logging
import bcrypt
from app.database import get_database
import uuid

from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.models.token import Token
from app.models.user import UserSchema, UserLoginSchema, UserUpdateFields, UserPublic
from app.models.response import MessageModel

from bson import ObjectId
from pathlib import Path
import smtplib
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader

logger = logging.getLogger(__name__)

# Убираем CryptContext, вместо него работаем с bcrypt напрямую
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = os.environ.get("SECRET_KEY", '09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7')
ALGORITHM = os.environ.get("ALGORITHM", 'HS256')
CONFIRM_TOKEN_EXPIRE_DAYS = int(os.environ.get("CONFIRM_TOKEN_EXPIRE_DAYS", 30))
CONFIRM_TOKEN_TTL_HOURS = int(os.environ.get("CONFIRM_TOKEN_TTL_HOURS", 24))
CONFIRMATION_LINK = os.environ.get("CONFIRMATION_LINK", "http://localhost:8080/user/confirm/")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 15))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ.get("REFRESH_TOKEN_EXPIRE_DAYS", 30))

def send_email(send_to: str, token: str) -> MessageModel:
    sender_email = os.environ.get("SENDER_EMAIL")
    sender_password = os.environ.get("SENDER_PASS")
    recipient_email = send_to
    env = Environment(loader=FileSystemLoader(Path.cwd() / 'templates'))
    template = env.get_template('email.html')
    context = {
        'subject': 'Email confirmation'    
    }
    confirmation_link = CONFIRMATION_LINK + token 
    html = template.render(confirmation_link=confirmation_link)
    html_message = MIMEText(html, 'html')
    html_message['Subject'] = context['subject']
    html_message['From'] = sender_email
    html_message['To'] = recipient_email
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, recipient_email, html_message.as_string())
    return MessageModel(message="Please check your E-Mail and confirm it.")

# Новые чистые функции хэширования (совместимы со старыми хэшами в БД)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def _store_refresh_jti(user_id: str, jti: str, expires_at):
    collection = get_database()["refresh_tokens"]
    collection.insert_one({"jti": jti, "user_id": user_id, "expires_at": expires_at})


def _delete_refresh_jti(jti: str):
    collection = get_database()["refresh_tokens"]
    collection.delete_one({"jti": jti})


def create_refresh_token(user_id: str) -> str:
    """Create a refresh JWT containing a unique jti and persist the jti in DB."""
    jti = uuid.uuid4().hex
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": user_id, "jti": jti, "type": "refresh", "exp": expire}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    _store_refresh_jti(user_id, jti, expire)
    return token


def verify_refresh_token(token: str) -> str:
    """Verify refresh token signature and presence of jti in DB. Returns user_id if valid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    jti = payload.get("jti")
    user_id = payload.get("sub")
    if not jti or not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token payload")
    collection = get_database()["refresh_tokens"]
    doc = collection.find_one({"jti": jti})
    if not doc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked or unknown")
    expires_at = doc.get("expires_at")
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
            
    if datetime.now(timezone.utc) > expires_at:
        _delete_refresh_jti(jti)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")
    return user_id


def rotate_refresh_token(old_token: str) -> str:
    """Replace old refresh token with a new one (rotation). Returns new token."""
    try:
        payload = jwt.decode(old_token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    jti_old = payload.get("jti")
    user_id = payload.get("sub")
    if not jti_old or not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token payload")
    _delete_refresh_jti(jti_old)
    return create_refresh_token(user_id)


def revoke_refresh_token(token: str) -> bool:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return False
    jti = payload.get("jti")
    if not jti:
        return False
    _delete_refresh_jti(jti)
    return True

def get_user(username: str):
    collection = get_database()["users"]
    doc = collection.find_one({"username": username})
    if not doc:
        return None
    # Convert ObjectId to string for callers that expect a serializable id
    try:
        doc["_id"] = str(doc.get("_id"))
    except Exception:
        pass
    return doc

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user['password']):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def user_to_public(user: dict) -> UserPublic | None:
    """Return a public-facing `UserPublic` model for a DB user document."""
    if not user:
        return None
    return UserPublic(
        id=user.get("_id"),
        username=user.get("username"),
        name=user.get("name"),
        surname=user.get("surname"),
        email=user.get("email"),
        workLocation=user.get("workLocation"),
        role=user.get("role"),
    )


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserPublic:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = None
    try:
        user = get_user_by_id(user_id)
    except Exception:
        user = None
    if user is None:
        raise credentials_exception
    public = user_to_public(user)
    if public is None:
        raise credentials_exception
    return public


def get_user_by_id(user_id: str):
    collection = get_database()["users"]
    try:
        doc = collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None
    if not doc:
        return None
    try:
        doc["_id"] = str(doc.get("_id"))
    except Exception:
        pass
    return doc


def get_current_active_user(current_user: Annotated[UserPublic, Depends(get_current_user)]) -> UserPublic:
    # if current_user.disabled:
    #     raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def insert_user(user):
    collection = get_database()["users"]
    # Insert user record and return inserted id (string)
    now = datetime.now(timezone.utc)
    doc = {
        "email": user["email"],
        "name": user["name"],
        "surname": user["surname"],
        "role": user.get("role", "operator"),
        "username": user["username"],
        "password": user["password"],
        "workLocation": user.get("workLocation"),
        "confirmed": user.get("confirmed", False),
        "created_at": user.get("created_at", now),
    }
    result = collection.insert_one(doc)
    return str(result.inserted_id)

def create_confirm_token(user_id: str) -> str:
    """Create a signed confirmation token that encodes the user's id."""
    access_token_expires = timedelta(days=CONFIRM_TOKEN_EXPIRE_DAYS)
    token = create_access_token(data={"sub": str(user_id)}, expires_delta=access_token_expires)
    return token


def get_user_by_email(email: str):
    collection = get_database()["users"]
    doc = collection.find_one({"email": email})
    if not doc:
        return None
    try:
        doc["_id"] = str(doc.get("_id"))
    except Exception:
        pass
    return doc


def resend_confirmation_email(send_to: str):
    """Send a fresh confirmation token to the given user's email."""
    user = get_user_by_email(send_to)
    if not user:
        return MessageModel(message="No user found with this email.")
    if user.get("confirmed"):
        return MessageModel(message="Email already confirmed.")
    token = create_confirm_token(user.get("_id"))
    return send_email(send_to, token)

def create_user(user: UserSchema):
    # refuse if username or email already exists
    if get_user(user.username) is not None or get_user_by_email(user.email) is not None:
        return MessageModel(message="User already exists.")
    hashed = get_password_hash(user.password)
    now = datetime.now(timezone.utc)
    user_doc = {
        "email": user.email,
        "name": user.name,
        "surname": user.surname,
        "role": "operator",
        "username": user.username,
        "password": hashed,
        "workLocation": user.workLocation.dict() if hasattr(user.workLocation, "dict") else user.workLocation,
        "confirmed": False,
        "created_at": now,
    }
    inserted_id = insert_user(user_doc)
    token = create_confirm_token(inserted_id)
    return send_email(user.email, token)

def update_current_user(current_user: UserPublic, fields: UserUpdateFields):
    collection = get_database()["users"]
    # Update only allowed fields: name, surname, workLocation
    update_doc = {"name": fields.name, "surname": fields.surname}
    if fields.workLocation is not None:
        update_doc["workLocation"] = fields.workLocation.dict() if hasattr(fields.workLocation, "dict") else fields.workLocation
    collection.update_one({"_id": ObjectId(current_user.id)}, {"$set": update_doc})
    return MessageModel(message="Success")

def confirm_email(token: str):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except ExpiredSignatureError:
        return MessageModel(message="Confirmation token expired. Please request a new confirmation email.")
    except JWTError:
        raise credentials_exception
    user_id = payload.get("sub")
    if not user_id:
        return MessageModel(message="Error in token")
    collection = get_database()["users"]
    try:
        user_doc = collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return MessageModel(message="Error in token")
    if not user_doc:
        return MessageModel(message="Error in token")
    if user_doc.get("confirmed"):
        return MessageModel(message="Already confirmed")
    collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"confirmed": True}})
    return MessageModel(message="Success")


def update_username(current_user: UserPublic, new_username: str):
    collection = get_database()["users"]
    # ensure username not used by another account
    existing = collection.find_one({"username": new_username, "_id": {"$ne": ObjectId(current_user.id)}})
    if existing:
        return MessageModel(message="Username already taken")
    collection.update_one({"_id": ObjectId(current_user.id)}, {"$set": {"username": new_username}})
    return MessageModel(message="Username updated")


def update_email(current_user: UserPublic, new_email: str):
    collection = get_database()["users"]
    # ensure email not used by another account
    existing = collection.find_one({"email": new_email, "_id": {"$ne": ObjectId(current_user.id)}})
    if existing:
        return MessageModel(message="Email already in use")
    # set new email and mark unconfirmed
    collection.update_one({"_id": ObjectId(current_user.id)}, {"$set": {"email": new_email, "confirmed": False}})
    token = create_confirm_token(current_user.id)
    return send_email(new_email, token)
