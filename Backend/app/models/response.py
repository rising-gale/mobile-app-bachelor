from typing import Generic, TypeVar, Optional, List, Dict, Any
from pydantic import BaseModel, Field
from pydantic.generics import GenericModel

T = TypeVar('T')


class ApiResponse(GenericModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    message: Optional[str] = None
    error: Optional[str] = None
    code: Optional[int] = None


class MessageModel(BaseModel):
    message: str


class IdModel(BaseModel):
    id: str


class AssessmentIdModel(BaseModel):
    assessment_id: str


class PageCountModel(BaseModel):
    page_count: int


class AnyListModel(BaseModel):
    items: List[Dict[str, Any]] = Field(...)
