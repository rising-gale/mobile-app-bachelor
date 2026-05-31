from fastapi import APIRouter, Depends, File, UploadFile, Body, Security, HTTPException, status, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from fastapi.responses import FileResponse

from app.services import assessment as AssessmentService
from app.services import user as UserService
from app.models.assessment import (
    AssessmentSchema,
    NumberInfoSchema,
    AssessmentOut,
    AssessmentSummary,
    NumberWithHistory,
    ResultEnum
)
from typing import Optional
from app.models.user import UserPublic
# user dependency returns raw dict from DB
from app.models.response import ApiResponse, MessageModel, IdModel, PageCountModel
from app.utils.response import success
import json
from typing import Annotated

import shutil
import uuid
import os
from pathlib import Path

router = APIRouter()
#dependencies=[Depends(JWTBearer())],

@router.post('/assessment/check_number', tags=['assessment'], response_model=ApiResponse[NumberWithHistory])
def check_NumberPlate(image: UploadFile = File(...)):
    return ApiResponse(success=True, data=AssessmentService.checkNumber(image))

@router.post('/assessment/save_number_info', tags=['assessment'], response_model=ApiResponse[IdModel])
def save_NumberPlate(number_info: NumberInfoSchema):
    return ApiResponse(success=True, data=AssessmentService.saveNumberInfo(number_info.information))

@router.post('/assessment/submit', 
             tags=['assessment'], 
             response_model=ApiResponse[IdModel],
             responses={401: {"model": ApiResponse[MessageModel], "description": "Unauthorized"}})
def submit_Assessment(
    user_data: UserPublic = Depends(UserService.get_current_active_user),
    digits: str = Form(...),
    result: ResultEnum = Form(...),
    comment: str = Form(...),
    location: str = Form(...),   # Принимаем как строку (JSON-строку с фронта)
    direction: str = Form(...),  # Принимаем как строку (JSON-строку с фронта)
    image: Optional[UploadFile] = File(None) # Файл картинки теперь опционален здесь
):
    # 1. Парсим строки JSON в словари/объекты для Pydantic
    try:
        location_data = json.loads(location)
        direction_data = json.loads(direction)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Невалидный формат JSON для локации или направления: {str(e)}"
        )

    # 2. Валидируем данные через существующую Pydantic схему
    # Благодаря вашей проверке hasattr(..., "dict") в сервисе, туда можно передавать как словарь, так и объект
    try:
        assessment_data = AssessmentSchema(
            digits=digits,
            result=result,
            comment=comment,
            location=location_data,
            direction=direction_data,
            image=None
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail=f"Ошибка валидации данных: {str(e)}"
        )

    # 3. Сохраняем текстовую часть инспекции в MongoDB и получаем ID записи
    submit_result = AssessmentService.submitAssessment(assessment_data, user_data.id)
    assessment_id = submit_result.get("assessment_id")

    if not assessment_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Не удалось сохранить инспекцию в базу данных"
        )

    # 4. Если фронтенд прикрепил файл изображения — обрабатываем его на месте
    if image and image.filename:
        original_name = image.filename
        _, ext = os.path.splitext(original_name)
        ext = ext.lower()
        allowed_exts = {'.jpg', '.jpeg', '.png'}
        
        if ext not in allowed_exts:
            ext = '.jpg'
            
        filename = f"{uuid.uuid4().hex}{ext}"
        base = Path('media')
        base.mkdir(parents=True, exist_ok=True)
        file_path = (base / filename).resolve()
        
        # Защита от Path Traversal
        if not str(file_path).startswith(str(base.resolve())):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Invalid file path"
            )
            
        # Сохраняем файл на диск
        with open(file_path, 'wb+') as file_object:
            shutil.copyfileobj(image.file, file_object)
            
        # Обновляем поле "image" в только что созданном документе MongoDB
        AssessmentService.save_image_to_assessment(assessment_id, filename)

    # Возвращаем ID созданной инспекции фронтенду
    return ApiResponse(success=True, data={"id": assessment_id})

@router.get('/assessment/get_number', tags=['assessment'], response_model=ApiResponse[NumberWithHistory])
def get_number(digits: str):
    return ApiResponse(success=True, data=AssessmentService.getNumberInfo(digits))

@router.get("/assessment/history", tags=["assessment"], response_model=ApiResponse[list[AssessmentSummary]],
    responses={401: {"model": ApiResponse[MessageModel], "description": "Unauthorized"}}
)
def get_user_assessment_history(pageNumber: int, user_data: UserPublic = Depends(UserService.get_current_active_user)):
    return ApiResponse(success=True, data=AssessmentService.get_assessment_history(user_data.id, pageNumber))

@router.get("/assessment/page_count", tags=["assessment"], response_model=ApiResponse[PageCountModel],
    responses={401: {"model": ApiResponse[MessageModel], "description": "Unauthorized"}}
)
def get_user_history_page_count(user_data: UserPublic = Depends(UserService.get_current_active_user)):
    return ApiResponse(success=True, data={"page_count": AssessmentService.get_page_count(user_data.id)})

@router.get('/assessment/get_history_by_digits', tags=['assessment'], response_model=ApiResponse[list[AssessmentSummary]])
def get_history_by_digits(digits: str):
    return ApiResponse(success=True, data=AssessmentService.get_assessment_history_by_digits(digits))

@router.get('/assessment/get_assessment_by_id', tags=['assessment'], response_model=ApiResponse[AssessmentOut],
    responses={401: {"model": ApiResponse[MessageModel], "description": "Unauthorized"}, 403: {"model": ApiResponse[MessageModel], "description": "Forbidden"}, 404: {"model": ApiResponse[MessageModel], "description": "Not Found"}}
)
def get_assessment_by_id(assessment_id: str, user_data: UserPublic = Depends(UserService.get_current_active_user)):
    # Only owner can fetch detailed assessment
    if not AssessmentService.is_owner(assessment_id, user_data.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return ApiResponse(success=True, data=AssessmentService.get_assessment_by_id(assessment_id))

@router.delete('/assessment/delete_by_id', tags=['assessment'], response_model=ApiResponse[MessageModel],
    responses={401: {"model": ApiResponse[MessageModel], "description": "Unauthorized"}, 403: {"model": ApiResponse[MessageModel], "description": "Forbidden"}, 404: {"model": ApiResponse[MessageModel], "description": "Not Found"}}
)
def delete_assessment_by_id(assessment_id: str, user_data: UserPublic = Depends(UserService.get_current_active_user)):
    if not AssessmentService.is_owner(assessment_id, user_data.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return ApiResponse(success=True, data=AssessmentService.delete_assessment(assessment_id))    

@router.post('/assessment/save_image', tags=['assessment'], response_model=ApiResponse[MessageModel],
    responses={401: {"model": ApiResponse[MessageModel], "description": "Unauthorized"}, 403: {"model": ApiResponse[MessageModel], "description": "Forbidden"}, 404: {"model": ApiResponse[MessageModel], "description": "Not Found"}}
)
def saveImage(assessment_id: str, user_data: UserPublic = Depends(UserService.get_current_active_user), image: UploadFile = File(...)):
    # ownership check
    if not AssessmentService.is_owner(assessment_id, user_data.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    # generate a safe filename (uuid + extension)
    original_name = image.filename or ''
    _, ext = os.path.splitext(original_name)
    ext = ext.lower()
    allowed_exts = {'.jpg', '.jpeg', '.png'}
    if ext not in allowed_exts:
        # default to .jpg if missing or not allowed
        ext = '.jpg'
    filename = f"{uuid.uuid4().hex}{ext}"
    base = Path('media')
    base.mkdir(parents=True, exist_ok=True)
    file_path = (base / filename).resolve()
    # ensure path is inside media directory
    if not str(file_path).startswith(str(base.resolve())):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Invalid file path")
    with open(file_path, 'wb+') as file_object:
        shutil.copyfileobj(image.file, file_object)
    AssessmentService.save_image_to_assessment(assessment_id, filename)
    return ApiResponse(success=True, data={"message": f"file '{filename}' saved"})