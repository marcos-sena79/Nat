from pydantic import BaseModel
from typing import Any, Optional, Generic, TypeVar

T = TypeVar('T')

class ResponseBase(BaseModel, Generic[T]):
    success: bool = True
    message: Optional[str] = None
    data: Optional[T] = None

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    per_page: int
    pages: int

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    detail: Optional[str] = None

class MessageResponse(BaseModel):
    success: bool = True
    message: str