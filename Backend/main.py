import uvicorn 
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.routers import assessment as AssessmentRouter
from app.routers import user as UserRouter

from pathlib import Path

app = FastAPI()
app.include_router(AssessmentRouter.router)
app.include_router(UserRouter.router)

app.mount('/image', StaticFiles(directory=Path.cwd() / 'server/media'), name='media')

if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8080, reload=True, workers=3)