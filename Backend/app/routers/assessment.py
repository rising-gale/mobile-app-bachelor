from fastapi import APIRouter, Depends, File, UploadFile, Body, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from fastapi.responses import FileResponse

from app.services import assessment as AssessmentService
from app.services import user as UserService
from app.models.assessment import AssessmentSchema, NumberInfoSchema
from app.models.user import UserSchema

from typing import Annotated

import shutil

router = APIRouter()
#dependencies=[Depends(JWTBearer())],

@router.post('/assessment/check_number', tags=['assessment'])
def check_NumberPlate(image: UploadFile = File(...)):
    return AssessmentService.checkNumber(image)

@router.post('/assessment/save_number_info', tags=['assessment'])
async def save_NumberPlate(number_info: NumberInfoSchema):
    # print(number_info)
    return AssessmentService.saveNumberInfo(number_info.information)

@router.post(('/assessment/submit'), tags=['assessment'])
async def submit_Assessment(user_data: Annotated[UserSchema, Depends(UserService.get_current_active_user)], assessment: AssessmentSchema = Body(...) ):
    return AssessmentService.submitAssessment(assessment, user_data['username'])

@router.get('/assessment/get_number', tags=['assessment'])
async def get_number(digits: str):
    return AssessmentService.getNumberInfo(digits)

@router.get("/assessment/history", tags=["assessment"])
def get_user_assessment_history(user_data: Annotated[UserSchema, Depends(UserService.get_current_active_user)], pageNumber: int):
    return AssessmentService.get_assessment_history(user_data['username'], pageNumber)

@router.get("/assessment/page_count", tags=["assessment"])
def get_user_history_page_count(user_data: Annotated[UserSchema, Depends(UserService.get_current_active_user)]):
    return AssessmentService.get_page_count(user_data['username'])

@router.get('/assessment/get_history_by_digits', tags=['assessment'])
def get_history_by_digits(digits):
    return AssessmentService.get_assessment_history_by_digits(digits)

@router.get("/assessment/get_assessment_by_id", tags=["assessment"])
def get_assessment_by_id(assessment_id):
    return AssessmentService.get_assessment_by_id(assessment_id)

@router.delete("/assessment/delete_by_id", tags=["assessment"])
def delete_assessment_by_id(assessment_id):
    return AssessmentService.delete_assessment(assessment_id)    

@router.post('/assessment/save_image', tags=['assessment'])
async def saveImage(assessment_id: str, image: UploadFile = File(...)):
    print(assessment_id, image.filename)
    file_location = f"media/{image.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(image.file, file_object)
    AssessmentService.save_image_to_assessment(assessment_id, image.filename)    
    return {"info": f"file '{image.filename}' saved at '{file_location}'"}