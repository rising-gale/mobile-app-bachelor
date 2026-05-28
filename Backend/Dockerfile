# --- ЕТАП 1: Офіційне оточення від авторів Nomeroff Net ---
FROM python:3.12-slim

# Налаштування таймзони та вимкнення інтерактивних вікон
ENV DEBIAN_FRONTEND=noninteractive \
    TZ=Europe/Kiev \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Оновлення та встановлення системних залежностей
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    manpages-dev \
    libglib2.0-0 \
    libgl1 \
    git \
    python3-setuptools \
    python3-wheel \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m pip install --upgrade pip

# Встановлення базових ML/CV бібліотек
RUN python3 -m pip install cython setuptools numpy opencv_python scikit_image asyncio gitpython pycocotools ujson pillow tqdm matplotlib scipy seaborn ipywidgets gevent termcolor scikit-learn albumentations

# Встановлення Torch і пов'язаних пакетів (CPU-версія)
# RUN python3 -m pip install torch>=1.12 torchvision>=0.13 --index-url https://download.pytorch.org/whl/cpu

# Встановлення Torch і пов'язаних пакетів (Фиксируем стабильную версию 2.5.1)
RUN python3 -m pip install torch==2.5.1 torchvision==0.20.1 --index-url https://download.pytorch.org/whl/cpu

# Встановлення Ultralytics та інструментів навчання
RUN python3 -m pip install "ultralytics>=8.3.12" "pytorch_lightning==1.8.6"

# Встановлення специфічних git-репозиторіїв від ria-com
RUN python3 -m pip install "git+https://github.com/ria-com/upscaler.git"
RUN python3 -m pip install "git+https://github.com/ria-com/craft-text-detector.git"
RUN python3 -m pip install "git+https://github.com/lilohuang/PyTurboJPEG.git"
RUN python3 -m pip install "git+https://github.com/ria-com/modelhub-client.git"


# --- ЕТАП 2: Інтеграція твого FastAPI додатка ---
WORKDIR /app

# Копіюємо оновлений requirements.txt і встановлюємо FastAPI, PyMongo та сам Nomeroff-Net
COPY requirements.txt /app/requirements.txt
RUN python3 -m pip install --no-cache-dir -r /app/requirements.txt

# Копіюємо весь твій код бекенду в контейнер
COPY . /app

# Налаштовуємо папку для збереження моделей всередині Docker
RUN mkdir -p /models
ENV NOMEROFF_MODELS_DIR=/models

# Стягуємо самі ваги AI-моделей на етапі збірки (запікаємо їх в образ)
RUN python3 -c "from nomeroff_net import pipeline; pipeline('number_plate_detection_and_reading', image_loader='opencv')"

EXPOSE 8080

# Запускаємо твій FastAPI сервер (uvicorn) навпростець
# Вместо uvicorn app.main:app --host 0.0.0.0 --port 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]