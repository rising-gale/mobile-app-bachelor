# Lazy-initialized nomeroff pipeline and unzip helper
import os
from datetime import datetime

import tempfile

import cv2
import numpy as np
import traceback  # <-- Добавь импорт в самый верх файла

import pymongo
from fastapi import HTTPException

from .user import get_user
from app.database import database

from bson import ObjectId

_nomeroff_pipeline = None
_nomeroff_unzip = None

def get_nomeroff_pipeline():
    """Return a singleton nomeroff pipeline instance. Raises HTTPException on failure."""
    global _nomeroff_pipeline
    global _nomeroff_unzip
    if _nomeroff_pipeline is None:
        try:
            from nomeroff_net import pipeline
            from nomeroff_net.tools import unzip
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Required package 'nomeroff_net' is not installed or failed to import: {e}")

        try:
            # Allow overriding models directory via env var if needed
            models_dir = os.environ.get('NOMEROFF_MODELS_DIR')
            # The nomeroff pipeline constructor may accept different args; keep the original signature
            _nomeroff_pipeline = pipeline("number_plate_detection_and_reading", image_loader="opencv")
            _nomeroff_unzip = unzip
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to initialize nomeroff pipeline: {e}")
    return _nomeroff_pipeline, _nomeroff_unzip

#Only info by number
def getNumber(digits: str):
    collection = database["numberplates"]
    number_info = collection.find_one({'digits':digits}, {'_id':0,'digits':1,'vin':1,'region':1,'vendor':1,'model':1,'model_year':1,'photo_url':1,'is_stolen':1,'stolen_details':1,'operations':1,'comments':1})
    print(number_info)
    if(number_info != None):
        return number_info
    else:
        return {'message': 'Number doesn`t exist in our DB.', 'digits': digits}

#Number info with history
def getNumberInfo(digits):
    return {'number_info': getNumber(digits), 'number_history': get_assessment_history_by_digits(digits)}

# Gets number automatically from image, gets info by number from our DB if exist, gets history of assessments by this number
def checkNumber(upload_file):
    print(f"Принят файл: {upload_file.filename}")
    # 1. Создаем временный файл на диске внутри контейнера.
    # Используем delete=False, чтобы файл не удалился сразу при закрытии,
    # так как нейросети нужно будет открыть его по этому пути заново.
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    temp_path = temp_file.name

    try:
        # 2. Считываем байты из запроса и записываем во временный файл
        file_bytes = upload_file.file.read()
        temp_file.write(file_bytes)
        temp_file.close()  # Закрываем дескриптор, чтобы освободить файл для OpenCV

        # 3. Инициализируем пайплайн
        pipeline, unzip = get_nomeroff_pipeline()
        
        # 4. Передаем ПУТЬ к временному файлу (temp_path) вместо матрицы
        res = pipeline([temp_path])
        (images, images_bboxs, images_points, images_zones, region_ids, region_names, count_lines, confidences, texts) = unzip(res)
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc() 
        raise HTTPException(status_code=500, detail=f"ANPR processing error: {e}")
    finally:
        # 5. Этот блок выполнится ВСЕГДА (и при успехе, и при ошибке).
        # Гарантированно подчищаем за собой временный файл с диска контейнера.
        if os.path.exists(temp_path):
            os.remove(temp_path)
    # Validate results structure safely
    try:
        rn0 = region_names[0] if region_names else None
    except Exception:
        rn0 = None

    if rn0 and rn0[0] == 'eu_ua_1995':
        return {'message': 'Номер зразка до 2004 року не підтримується.'}

    try:
        if texts and texts[0]:
            plate = texts[0][0]
            return {'number_info': getNumber(plate), 'number_history': get_assessment_history_by_digits(plate)}
        else:
            return {'message': 'Номер не знайдено на фотографії.'}
    except Exception as e:
        traceback.print_exc()  # <-- И СЮДА: на случай, если упало при разборе текста
        raise HTTPException(status_code=500, detail=f"Error processing recognition results: {e}")

#Saves number info to out DB
def saveNumberInfo(number_info):
    collection = database["numberplates"]
    print(collection.insert_one(number_info))
    return {'message': 'Success'}

#Submits new Assessment
def submitAssessment(assessment, username):
    user = get_user(username)
    collection = database["assessments"]
    result = collection.insert_one({'digits': assessment.digits, 'result': assessment.result, 'comment': assessment.comment, 'location': assessment.location, 
        'direction': assessment.direction, 'date_time': datetime.now(), 'image': '', 'u_id': ObjectId(user['_id'])})
    return {'assessment_id': str(result.inserted_id)}

#Gets assessments history of user by username
def get_assessment_history(username, pageNumber):
    user_data = get_user(username)
    collection = database["assessments"]
    print(user_data['_id'])
    assessments_history = []
    for document in collection.find({'u_id': ObjectId(user_data['_id'])}, 
        {"_id" : { "$toString": "$_id" }, "digits" : 1, "result": 1, "comment": 1, "location": 1, "direction": 1, "date_time": 1, "image": 1}).sort('date_time', pymongo.DESCENDING).skip(10*(pageNumber-1)).limit(10):
        assessments_history.append(document) 
    return assessments_history

def get_page_count(username):
    user_data = get_user(username)
    collection = database["assessments"]
    count = collection.count_documents({'u_id': ObjectId(user_data['_id'])})
    if(count % 10 == 0):
        return count // 10
    else: return (count // 10) + 1

#Gets assessments history by numberplate
def get_assessment_history_by_digits(digits):
    collection = database["assessments"]
    assessments_history = []
    for document in collection.find({'digits': digits}, {"_id" : { "$toString": "$_id" }, "digits" : 1, "result": 1, "comment": 1, "location": 1, "direction": 1, "date_time": 1, "image": 1}).sort('date_time', pymongo.DESCENDING).limit(5):
        assessments_history.append(document) 
    return assessments_history

#Gets assessment by ID
def get_assessment_by_id(assessment_id):
    collection = database["assessments"]
    return collection.find_one({'_id': ObjectId(assessment_id)}, {"_id" : { "$toString": "$_id" }, "digits" : 1, "result": 1, "comment": 1, "location": 1, "direction": 1, "date_time": 1, "image": 1})

#Saves image to server and sets it to assessment that is complete
def save_image_to_assessment(assessment_id, filename):
    # assessment_data = get_assessment_by_id(assessment_id)
    collection = database["assessments"]
    collection.update_one({'_id': ObjectId(assessment_id)}, {"$set": { "image": filename }})
    return {'message': 'Success'}

#Deletes assessment by ID
def delete_assessment(assessment_id):
    collection = database["assessments"]
    collection.delete_one({'_id': ObjectId(assessment_id)})
    return {'message': 'Success'}

