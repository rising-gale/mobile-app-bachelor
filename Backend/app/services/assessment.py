"""Assessment service: encapsulates logic for number plate recognition
and assessment persistence."""
import os
import logging
from datetime import datetime
import tempfile
import traceback

import pymongo
import requests
from fastapi import HTTPException

from .user import get_user_by_id
from app.database import get_database
from app.models.response import MessageModel

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

def fetch_and_save_external_number(digits: str) -> dict:
    """
    Вспомогательная функция для запроса данных из внешнего API
    и их автоматического кэширования в нашу MongoDB.
    """
    # Токен можно вынести в переменные окружения (.env), оставив ваш ключ как дефолтный
    api_key = os.environ.get('BAZA_GAI_API_KEY', 'REDACTED_BAZA_GAI_API_KEY')
    url = f"https://baza-gai.com.ua/nomer/{digits}"
    headers = {
        "Accept": "application/json",
        "X-Api-Key": api_key
    }

    try:
        logger.info("Fetching data from external API for plate: %s", digits)
        # Ставим таймаут 5 секунд, чтобы бэкенд не завис, если внешнее АПИ упадет
        response = requests.get(url, headers=headers, timeout=60)
        
        if response.status_code == 200:
            external_data = response.json()
            
            # Формируем документ строго под структуру нашей Pydantic-модели NumberInfoOut
            number_document = {
                "digits": digits,
                "vin": external_data.get("vin"),
                "region": external_data.get("region"),
                "vendor": external_data.get("vendor"),
                "model": external_data.get("model"),
                "model_year": external_data.get("model_year"),
                "photo_url": external_data.get("photo_url"),
                "is_stolen": external_data.get("is_stolen", False),
                "stolen_details": external_data.get("stolen_details"),
                "operations": external_data.get("operations", []),
                "comments": external_data.get("comments", [])
            }
            
            # Сохраняем в локальную БД для кэша
            collection = get_database()["numberplates"]
            collection.insert_one(number_document)
            
            # MongoDB добавляет поле _id при вставке, удаляем его перед возвратом на фронт
            number_document.pop("_id", None)
            logger.info("Successfully cached external data for plate: %s", digits)
            return number_document
            
        else:
            logger.warning("External API returned status %s for plate %s", response.status_code, digits)
            
    except Exception as e:
        logger.error("Failed to process external API request for %s: %s", digits, str(e))
    
    # ФОЛЛБЭК: Если номера нет во внешней базе (404) или АПИ лежит,
    # возвращаем пустой скелет с номером, чтобы интерфейс приложения не ломался.
    return {
        "digits": digits,
        "vin": None,
        "region": None,
        "vendor": None,
        "model": None,
        "model_year": None,
        "photo_url": None,
        "is_stolen": False,
        "stolen_details": None,
        "operations": [],
        "comments": []
    }

#Only info by number
def getNumber(digits: str):
    collection = get_database()["numberplates"]
    number_info = collection.find_one(
        {"digits": digits},
        {"_id": 0, "digits": 1, "vin": 1, "region": 1, "vendor": 1, "model": 1, "model_year": 1, "photo_url": 1, "is_stolen": 1, "stolen_details": 1, "operations": 1, "comments": 1},
    )
    # Сценарий 1: Номер уже есть в нашей БД
    if number_info is not None:
        logger.debug("getNumber(%s) -> Found in local DB", digits)
        return number_info
        
    # Сценарий 2: Номера в нашей БД нет -> Идем во внешнее АПИ, сохраняем и отдаем
    logger.debug("getNumber(%s) -> Not found locally. Triggering external fetch.", digits)
    return fetch_and_save_external_number(digits)

#Number info with history
def getNumberInfo(digits):
    return {'number_info': getNumber(digits), 'number_history': get_assessment_history_by_digits(digits)}

# Gets number automatically from image, gets info by number from our DB if exist, gets history of assessments by this number
def checkNumber(upload_file):
    """
    Принимает файл изображения, пропускает его через нейросеть Nomeroff Net
    для распознавания автомобильного номера и ищет историю по базе данных.

    :param image: Объект загруженного файла изображения от FastAPI.
    :return: Объект NumberWithHistory, содержащий информацию о номере и историю проверок.
    
    :raises HTTPException(500): Если библиотека nomeroff_net не установлена или упал пайплайн.
    :raises HTTPException(400): Если изображение повреждено или не может быть обработано OpenCV.
    """
    logger.info("Received file: %s", getattr(upload_file, 'filename', '<unknown>'))
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    temp_path = temp_file.name

    try:
        file_bytes = upload_file.file.read()
        temp_file.write(file_bytes)
        temp_file.close()

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
        # Гарантированно подчищаем за собой временный файл с диска контейнера.
        if os.path.exists(temp_path):
            os.remove(temp_path)
    # Validate results structure safely
    try:
        rn0 = region_names[0] if region_names else None
    except Exception:
        rn0 = None

    if rn0 and rn0[0] == 'eu_ua_1995':
        return {"message": "This number is before 2004 and is not acceptable."}

    try:
        if texts and texts[0]:
            plate = texts[0][0]
            return {"number_info": getNumber(plate), "number_history": get_assessment_history_by_digits(plate)}
        # no plate recognized
        return {"number_info": None, "number_history": []}
    except Exception as e:
        traceback.print_exc()
        logger.exception("Error processing recognition results")
        raise HTTPException(status_code=500, detail=f"Error processing recognition results: {e}")

#Saves number info to out DB
def saveNumberInfo(number_info):
    collection = get_database()["numberplates"]
    result = collection.insert_one(number_info)
    logger.debug("Inserted number_info id=%s", getattr(result, 'inserted_id', None))
    return {"id": str(result.inserted_id)}

#Submits new Assessment
def submitAssessment(assessment, user_id: str):
    collection = get_database()["assessments"]
    # Ensure enum/result and CityChoice are serialized to plain types for MongoDB
    location_val = assessment.location.dict() if hasattr(assessment.location, "dict") else assessment.location
    direction_val = assessment.direction.dict() if hasattr(assessment.direction, "dict") else assessment.direction
    result_val = assessment.result.value if hasattr(assessment.result, "value") else str(assessment.result)
    result = collection.insert_one(
        {
            "digits": assessment.digits,
            "result": result_val,
            "comment": assessment.comment,
            "location": location_val,
            "direction": direction_val,
            "date_time": datetime.now(),
            "image": "",
            "u_id": ObjectId(user_id),
        }
    )
    return {"assessment_id": str(result.inserted_id)}

#Gets assessments history of user by username
def get_assessment_history(user_id: str, pageNumber: int):
    collection = get_database()["assessments"]
    logger.debug("Fetching assessment history for user %s page %s", user_id, pageNumber)
    assessments_history = []
    cursor = collection.find({"u_id": ObjectId(user_id)}, {"digits": 1, "result": 1, "comment": 1, "location": 1, "direction": 1, "date_time": 1, "image": 1}).sort(
        "date_time", pymongo.DESCENDING
    ).skip(10 * (pageNumber - 1)).limit(10)
    for document in cursor:
        doc = {
            "id": str(document.get("_id")),
            "digits": document.get("digits"),
            "result": document.get("result"),
            "comment": document.get("comment"),
            "location": document.get("location"),
            "direction": document.get("direction"),
            "date_time": document.get("date_time"),
            "image": document.get("image"),
        }
        assessments_history.append(doc)
    return assessments_history

def get_page_count(user_id: str):
    collection = get_database()["assessments"]
    count = collection.count_documents({"u_id": ObjectId(user_id)})
    return (count + 9) // 10

#Gets assessments history by numberplate
def get_assessment_history_by_digits(digits):
    collection = get_database()["assessments"]
    assessments_history = []
    cursor = collection.find({"digits": digits}, {"digits": 1, "result": 1, "comment": 1, "location": 1, "direction": 1, "date_time": 1, "image": 1}).sort(
        "date_time", pymongo.DESCENDING
    ).limit(5)
    for document in cursor:
        doc = {
            "id": str(document.get("_id")),
            "digits": document.get("digits"),
            "result": document.get("result"),
            "comment": document.get("comment"),
            "location": document.get("location"),
            "direction": document.get("direction"),
            "date_time": document.get("date_time"),
            "image": document.get("image"),
        }
        assessments_history.append(doc)
    return assessments_history

#Gets assessment by ID
def get_assessment_by_id(assessment_id):
    collection = get_database()["assessments"]
    document = collection.find_one({"_id": ObjectId(assessment_id)})
    if not document:
        return None
    return {
        "id": str(document.get("_id")),
        "digits": document.get("digits"),
        "result": document.get("result"),
        "comment": document.get("comment"),
        "location": document.get("location"),
        "direction": document.get("direction"),
        "date_time": document.get("date_time"),
        "image": document.get("image"),
    }

def is_owner(assessment_id, user_id: str) -> bool:
    try:
        collection = get_database()["assessments"]
        doc = collection.find_one({"_id": ObjectId(assessment_id)}, {"u_id": 1})
        if not doc or "u_id" not in doc:
            return False
        return doc.get("u_id") == ObjectId(user_id)
    except Exception:
        return False

#Saves image to server and sets it to assessment that is complete
def save_image_to_assessment(assessment_id, filename) -> MessageModel:
    # assessment_data = get_assessment_by_id(assessment_id)
    collection = get_database()["assessments"]
    result = collection.update_one({"_id": ObjectId(assessment_id)}, {"$set": {"image": filename}})
    logger.debug("save_image_to_assessment updated: %s", result.modified_count)
    return MessageModel(message="Success")

#Deletes assessment by ID
def delete_assessment(assessment_id) -> MessageModel:
    collection = get_database()["assessments"]
    collection.delete_one({"_id": ObjectId(assessment_id)})
    return MessageModel(message="Success")

