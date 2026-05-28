import os
import logging
import uvicorn
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

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