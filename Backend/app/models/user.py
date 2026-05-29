from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional

class UserSchema(BaseModel):
    username: str = Field(...)
    name: str = Field(...)
    surname: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...)
    workLocation: str = Field(...)
    confirmed: bool = False
    created_at: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "void inside",
                "name": "Joe",
                "surname": "Millan",
                "email": "joe@xyz.com",
                "password": "any_hashed",
                "workLocation": "Lviv"
            }
        }

class UserLoginSchema(BaseModel):
    username: str = Field(...)
    password: str = Field(...)

    class Config:
        json_schema_extra = {
            "example": {
                "username": "void inside",
                "password": "any"
            }
        }


class UserPublic(BaseModel):
    username: str
    name: str
    surname: str
    email: EmailStr
    workLocation: str | None = None
    role: str | None = None


class UsernameUpdate(BaseModel):
    username: str = Field(...)


class EmailUpdate(BaseModel):
    email: EmailStr = Field(...)