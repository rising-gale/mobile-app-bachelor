import os
import logging
import uvicorn
import json
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi

from app.routers import assessment as AssessmentRouter
from app.routers import user as UserRouter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _media_path() -> str:
    # derive media folder relative to package root
    return str(Path(__file__).resolve().parent.parent / "media")


app = FastAPI(
    title="Mobile App - Numberplate Check API",
    description="API for numberplate recognition and assessments",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

def custom_openapi():
    # Если схема уже была сгенерирована ранее, возвращаем кэшированную версию
    if app.openapi_schema:
        return app.openapi_schema

    # Генерируем стандартную схему, автоматически подтягивая метаданные из app
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    # Конвертируем схему в строку для безопасной глобальной замены имён и $ref ссылок
    schema_json = json.dumps(openapi_schema)

    # Чистим уродливые пути Pydantic моделей, созданные из-за вложенности папок
    # Добавь сюда свои пути, если структуры папок изменятся
    schema_json = schema_json.replace("app.models.assessment.", "")
    schema_json = schema_json.replace("app.models.user.", "")
    schema_json = schema_json.replace("app.models.token.", "")
    schema_json = schema_json.replace("app.models.response.", "")
    
    # Убираем двойные подчёркивания на концах генерик-моделей (например, __)
    schema_json = schema_json.replace("__", "")

    # Возвращаем изменённый JSON обратно в формат словаря
    clean_openapi_schema = json.loads(schema_json)
    
    # Сохраняем в кэш приложения
    app.openapi_schema = clean_openapi_schema
    return app.openapi_schema

# Назначаем нашу кастомную функцию стандартному методу FastAPI
app.openapi = custom_openapi

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"success": False, "error": exc.detail})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error while processing request")
    return JSONResponse(status_code=500, content={"success": False, "error": "Internal Server Error"})


app.include_router(AssessmentRouter.router)
app.include_router(UserRouter.router)

# Serve media files (images) from /image
app.mount("/image", StaticFiles(directory=_media_path()), name="media")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    # When running directly, run the app with uvicorn. For production prefer
    # running `uvicorn app.main:app --host 0.0.0.0 --port 8080`.
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)