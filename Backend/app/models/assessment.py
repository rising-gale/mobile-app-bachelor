from pydantic import BaseModel, Field

class AssessmentSchema(BaseModel):
    digits: str = Field(...)
    result: str = Field(...)
    comment: str = Field(...)
    location: str = Field(...)
    direction: str = Field(...)
    image: str = Field(...)

    class Config:
        json_schema_extra = {
            "example": {
                "digits": "AC4921CB",
                "result": "OK \ Canceled",
                "comment": "Any",
                "location": "Kyiv",
                "direction": 'Lviv'
            }
        }

class NumberInfoSchema(BaseModel):
    information: dict = Field(...)