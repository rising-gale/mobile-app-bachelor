from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class AssessmentSchema(BaseModel):
    digits: str = Field(...)
    result: str = Field(...)
    comment: str = Field(...)
    location: str = Field(...)
    direction: str = Field(...)
    image: Optional[str] = Field(None)

    class Config:
        json_schema_extra = {
            "example": {
                "digits": "AC4921CB",
                "result": "OK \\ Canceled",
                "comment": "Any",
                "location": "Kyiv",
                "direction": 'Lviv'
            }
        }


class NumberInfoSchema(BaseModel):
    information: dict = Field(...)


# Output models
class AssessmentOut(BaseModel):
    id: str = Field(...)
    digits: Optional[str] = None
    result: Optional[str] = None
    comment: Optional[str] = None
    location: Optional[str] = None
    direction: Optional[str] = None
    date_time: Optional[datetime] = None
    image: Optional[str] = None


class AssessmentSummary(AssessmentOut):
    pass


class NumberInfoOut(BaseModel):
    digits: Optional[str] = None
    vin: Optional[str] = None
    region: Optional[str] = None
    vendor: Optional[str] = None
    model: Optional[str] = None
    model_year: Optional[int] = None
    photo_url: Optional[str] = None
    is_stolen: Optional[bool] = None
    stolen_details: Optional[str] = None
    operations: Optional[List[Dict[str, Any]]] = None
    comments: Optional[List[str]] = None


class NumberWithHistory(BaseModel):
    number_info: Optional[NumberInfoOut] = None
    number_history: List[AssessmentSummary] = []