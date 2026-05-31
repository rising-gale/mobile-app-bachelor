from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, List
from enum import Enum

class RoleEnum(str, Enum):
    operator = "operator"
    admin = "admin"


class CityChoice(BaseModel):
    label: str = Field(...)
    value: str = Field(...)


# A list of major Ukrainian cities for registration/workLocation selection
LOCATIONS: List[dict] = [
    {"label": "Київ", "value": "KY"},
    {"label": "Львів", "value": "LV"},
    {"label": "Одеса", "value": "OD"},
    {"label": "Харків", "value": "KH"},
    {"label": "Дніпро", "value": "DN"},
    {"label": "Запоріжжя", "value": "ZP"},
    {"label": "Вінниця", "value": "VN"},
    {"label": "Чернігів", "value": "CH"},
    {"label": "Черкаси", "value": "CK"},
    {"label": "Івано-Франківськ", "value": "IF"},
    {"label": "Ужгород", "value": "UZ"},
    {"label": "Луцьк", "value": "LT"},
    {"label": "Рівне", "value": "RV"},
    {"label": "Тернопіль", "value": "TP"},
    {"label": "Херсон", "value": "KS"},
    {"label": "Миколаїв", "value": "MY"},
    {"label": "Суми", "value": "SM"},
    {"label": "Полтава", "value": "PL"},
    {"label": "Кропивницький", "value": "KR"},
    {"label": "Житомир", "value": "ZH"},
]

class UserSchema(BaseModel):
    username: str = Field(...)
    name: str = Field(...)
    surname: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...)
    workLocation: CityChoice = Field(...)
    role: RoleEnum = RoleEnum.operator
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
    id: str
    username: str
    name: str
    surname: str
    email: EmailStr
    workLocation: CityChoice
    role: str


class UsernameUpdate(BaseModel):
    username: str = Field(...)


class EmailUpdate(BaseModel):
    email: EmailStr = Field(...)


class UserUpdateFields(BaseModel):
    name: str = Field(...)
    surname: str = Field(...)
    workLocation: CityChoice | None = None