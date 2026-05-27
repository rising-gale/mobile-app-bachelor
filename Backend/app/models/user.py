from pydantic import BaseModel, Field, EmailStr

class UserSchema(BaseModel):
    username: str = Field(...)
    name: str = Field(...)
    surname: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...)
    workLocation: str = Field(...)
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "void inside",
                "name": "Joe",
                "surname": "Millan",
                "email": "joe@xyz.com",
                "password": "any",
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