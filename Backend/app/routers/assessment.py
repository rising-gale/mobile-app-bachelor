from fastapi import APIRouter, Depends, File, UploadFile, Body, Security, HTTPException, status
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
)
# user dependency returns raw dict from DB
from app.models.response import ApiResponse, MessageModel, IdModel, AssessmentIdModel, PageCountModel
from app.utils.response import success

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

@router.post('/assessment/submit', tags=['assessment'], response_model=ApiResponse[AssessmentIdModel])
def submit_Assessment(user_data: Annotated[dict, Depends(UserService.get_current_active_user)], assessment: AssessmentSchema = Body(...) ):
    return ApiResponse(success=True, data=AssessmentService.submitAssessment(assessment, user_data['username']))

@router.get('/assessment/get_number', tags=['assessment'], response_model=ApiResponse[NumberWithHistory])
def get_number(digits: str):
    return ApiResponse(success=True, data=AssessmentService.getNumberInfo(digits))

@router.get("/assessment/history", tags=["assessment"], response_model=ApiResponse[list[AssessmentSummary]])
def get_user_assessment_history(user_data: Annotated[dict, Depends(UserService.get_current_active_user)], pageNumber: int):
    return ApiResponse(success=True, data=AssessmentService.get_assessment_history(user_data['username'], pageNumber))

@router.get("/assessment/page_count", tags=["assessment"], response_model=ApiResponse[PageCountModel])
def get_user_history_page_count(user_data: Annotated[dict, Depends(UserService.get_current_active_user)]):
    return ApiResponse(success=True, data={"page_count": AssessmentService.get_page_count(user_data['username'])})

@router.get('/assessment/get_history_by_digits', tags=['assessment'], response_model=ApiResponse[list[AssessmentSummary]])
def get_history_by_digits(digits):
    return ApiResponse(success=True, data=AssessmentService.get_assessment_history_by_digits(digits))

@router.get("/assessment/get_assessment_by_id", tags=["assessment"], response_model=ApiResponse[AssessmentOut])
def get_assessment_by_id(assessment_id: str, user_data: Annotated[dict, Depends(UserService.get_current_active_user)]):
    # Only owner can fetch detailed assessment
    if not AssessmentService.is_owner(assessment_id, user_data['username']):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return ApiResponse(success=True, data=AssessmentService.get_assessment_by_id(assessment_id))

@router.delete("/assessment/delete_by_id", tags=["assessment"], response_model=ApiResponse[MessageModel])
def delete_assessment_by_id(assessment_id: str, user_data: Annotated[dict, Depends(UserService.get_current_active_user)]):
    if not AssessmentService.is_owner(assessment_id, user_data['username']):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return ApiResponse(success=True, data=AssessmentService.delete_assessment(assessment_id))    

@router.post('/assessment/save_image', tags=['assessment'], response_model=ApiResponse[MessageModel])
def saveImage(assessment_id: str, user_data: Annotated[dict, Depends(UserService.get_current_active_user)], image: UploadFile = File(...)):
    # ownership check
    if not AssessmentService.is_owner(assessment_id, user_data['username']):
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