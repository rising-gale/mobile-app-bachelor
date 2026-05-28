import os
import logging
import bcrypt  # <-- Меняем passlib на чистый bcrypt
from app.database import get_database

from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.models.token import Token, TokenData
from app.models.user import UserSchema, UserLoginSchema

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
CONFIRMATION_LINK = os.environ.get("CONFIRMATION_LINK", "http://localhost:8080/user/confirm/") # <-- Добавили получение ссылки

def send_email(send_to: str, token: str):
    sender_email = os.environ.get("SENDER_EMAIL")
    sender_password = os.environ.get("SENDER_PASS")
    recipient_email = send_to
    env = Environment(loader=FileSystemLoader(Path.cwd() / 'templates'))
    template = env.get_template('email.html')
    context = {
        'subject': 'Підтвердження пошти'    
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
    return {"message": "Підтвердіть свою пошту."}

# Новые чистые функции хэширования (совместимы со старыми хэшами в БД)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def get_user(username: str):
    collection = get_database()["users"]
    return collection.find_one({"username": username}, {"_id": {"$toString": "$_id"}, "email": 1, "name": 1, "surname": 1, "role": 1, "username": 1, "password": 1, "workLocation": 1})

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
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: Annotated[UserSchema, Depends(get_current_user)]
):
    # if current_user.disabled:
    #     raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def insert_user(user):
    collection = get_database()["users"]
    collection.insert_one({
        "email": user["email"],
        "name": user["name"],
        "surname": user["surname"],
        "role": "operator",
        "isActive": True,
        "username": user["username"],
        "password": user["password"],
        "workLocation": user.get("workLocation"),
    })
    return {"message": "Registration complete, proceed to logging in"}

def insert_token(user):
    access_token_expires = timedelta(days=CONFIRM_TOKEN_EXPIRE_DAYS)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    collection = get_database()["confirm_tokens"]
    hashed = get_password_hash(user.password)
    collection.insert_one({'token':access_token,'email': user.email, 'name': user.name, 'surname': user.surname, 'username': user.username, 'password': hashed, 'workLocation': user.workLocation})
    return access_token

def create_user(user):
    if get_user(user.username) is None:
        collection = get_database()["confirm_tokens"]
        token_data = collection.find_one({"email": user.email})
        if token_data:
            return {"message": "User is already exist."}
        token = insert_token(user)
        return send_email(user.email, token)
    return {"message": "User is already exist."}

def update_current_user(user):
    collection = get_database()["users"]
    if get_user(user.username) is not None:
        collection.update_one({"username": user.username}, {"$set": {"email": user.email, "name": user.name, "surname": user.surname, "workLocation": user.workLocation}})

def confirm_email(token):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    # print('Token is: ', token)
    collection = get_database()["confirm_tokens"]
    token_data = collection.find_one({"token": token})
    # print('Token data is: ', token_data)
    if not token_data:
        logger.debug("No token found in DB for token")
        return {"message": "Error in token"}
    else:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                collection.delete_one({'_id': token_data['_id']})
                raise credentials_exception
            insert_user(token_data)
            collection = get_database()["confirm_tokens"]
            collection.delete_one({"_id": token_data["_id"]})
        except JWTError:
            raise credentials_exception
        return {"message": "Success"}
