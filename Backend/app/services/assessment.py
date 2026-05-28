"""Assessment service: encapsulates logic for number plate recognition
and assessment persistence."""
import os
import logging
from datetime import datetime
import tempfile
import traceback

import pymongo
from fastapi import HTTPException

from .user import get_user
from app.database import get_database

from bson import ObjectId

logger = logging.getLogger(__name__)

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
    collection = get_database()["numberplates"]
    number_info = collection.find_one(
        {"digits": digits},
        {"_id": 0, "digits": 1, "vin": 1, "region": 1, "vendor": 1, "model": 1, "model_year": 1, "photo_url": 1, "is_stolen": 1, "stolen_details": 1, "operations": 1, "comments": 1},
    )
    logger.debug("getNumber(%s) -> %s", digits, bool(number_info))
    if number_info is not None:
        return number_info
    return {"message": "Number doesn't exist in our DB.", "digits": digits}

#Number info with history
def getNumberInfo(digits):
    return {'number_info': getNumber(digits), 'number_history': get_assessment_history_by_digits(digits)}

# Gets number automatically from image, gets info by number from our DB if exist, gets history of assessments by this number
def checkNumber(upload_file):
    logger.info("Received file: %s", getattr(upload_file, 'filename', '<unknown>'))
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
        logger.exception("ANPR processing error")
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
        return {"message": "Номер зразка до 2004 року не підтримується."}

    try:
        if texts and texts[0]:
            plate = texts[0][0]
            return {"number_info": getNumber(plate), "number_history": get_assessment_history_by_digits(plate)}
        return {"message": "Номер не знайдено на фотографії."}
    except Exception as e:
        traceback.print_exc()
        logger.exception("Error processing recognition results")
        raise HTTPException(status_code=500, detail=f"Error processing recognition results: {e}")

#Saves number info to out DB
def saveNumberInfo(number_info):
    collection = get_database()["numberplates"]
    result = collection.insert_one(number_info)
    logger.debug("Inserted number_info id=%s", getattr(result, 'inserted_id', None))
    return {"message": "Success", "id": str(result.inserted_id)}

#Submits new Assessment
def submitAssessment(assessment, username):
    user = get_user(username)
    collection = get_database()["assessments"]
    result = collection.insert_one(
        {
            "digits": assessment.digits,
            "result": assessment.result,
            "comment": assessment.comment,
            "location": assessment.location,
            "direction": assessment.direction,
            "date_time": datetime.now(),
            "image": "",
            "u_id": ObjectId(user["_id"]),
        }
    )
    return {"assessment_id": str(result.inserted_id)}

#Gets assessments history of user by username
def get_assessment_history(username, pageNumber):
    user_data = get_user(username)
    collection = get_database()["assessments"]
    logger.debug("Fetching assessment history for user %s page %s", username, pageNumber)
    assessments_history = []
    cursor = collection.find({"u_id": ObjectId(user_data["_id"])}, {"_id": {"$toString": "$_id"}, "digits": 1, "result": 1, "comment": 1, "location": 1, "direction": 1, "date_time": 1, "image": 1}).sort(
        "date_time", pymongo.DESCENDING
    ).skip(10 * (pageNumber - 1)).limit(10)
    for document in cursor:
        assessments_history.append(document)
    return assessments_history

def get_page_count(username):
    user_data = get_user(username)
    collection = get_database()["assessments"]
    count = collection.count_documents({"u_id": ObjectId(user_data["_id"])})
    return (count + 9) // 10

#Gets assessments history by numberplate
def get_assessment_history_by_digits(digits):
    collection = get_database()["assessments"]
    assessments_history = []
    cursor = collection.find({"digits": digits}, {"_id": {"$toString": "$_id"}, "digits": 1, "result": 1, "comment": 1, "location": 1, "direction": 1, "date_time": 1, "image": 1}).sort(
        "date_time", pymongo.DESCENDING
    ).limit(5)
    for document in cursor:
        assessments_history.append(document)
    return assessments_history

#Gets assessment by ID
def get_assessment_by_id(assessment_id):
    collection = get_database()["assessments"]
    return collection.find_one({"_id": ObjectId(assessment_id)}, {"_id": {"$toString": "$_id"}, "digits": 1, "result": 1, "comment": 1, "location": 1, "direction": 1, "date_time": 1, "image": 1})

#Saves image to server and sets it to assessment that is complete
def save_image_to_assessment(assessment_id, filename):
    # assessment_data = get_assessment_by_id(assessment_id)
    collection = get_database()["assessments"]
    result = collection.update_one({"_id": ObjectId(assessment_id)}, {"$set": {"image": filename}})
    logger.debug("save_image_to_assessment updated: %s", result.modified_count)
    return {"message": "Success"}

#Deletes assessment by ID
def delete_assessment(assessment_id):
    collection = get_database()["assessments"]
    collection.delete_one({"_id": ObjectId(assessment_id)})
    return {"message": "Success"}

