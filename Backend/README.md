# Backend (FastAPI) — Docker deployment

This folder contains the FastAPI backend for the project and Docker configuration to run it in a container.

Key points
- The ANPR model uses the open-source `nomeroff-net` package (installed from GitHub).
- Model weights are not committed to the repository. The container will attempt to download and cache them on first start into `/app/models`.
- For cloud deployments, mount a persistent volume to `/app/models` or adapt `scripts/ensure_model.py` to use object storage.

Build the Docker image:
```bash
docker build -t mobile-backend:latest -f Backend/Dockerfile Backend/
```

Run the container (local run, with model cache volume):
```bash
docker run -it --rm -p 8080:8080 \
  -v backend_models:/app/models \
  -e MONGO_URI='mongodb://your-mongo:27017' \
  -e PORT=8080 \
  mobile-backend:latest
```

If you prefer to mount a host folder to inspect weights:
```bash
docker run -it --rm -p 8080:8080 \
  -v "$(pwd)/Backend/models":/app/models \
  -e MONGO_URI='mongodb://host.docker.internal:27017' \
  mobile-backend:latest
```

Health check
- The container runs `scripts/ensure_model.py` on startup to ensure `nomeroff-net` is installed and weights are cached. Check the container logs for `ensure_model: done` and a file `/app/models/.nomeroff_ready`.

Notes for cloud deploy
- Services like Render, Fly, or AWS ECS can run the built image. Ensure you provide persistence for `/app/models` or pre-bake weights into the image (not recommended for repo size reasons).

Using docker-compose
--------------------

The repository includes a `docker-compose.yml` file in the `Backend/` folder for convenient local development.

Recommended (from the `Backend/` directory):

```bash
cd Backend
docker compose up --build
```

Alternatively you can run the two separate steps:

```bash
cd Backend
docker compose build
docker compose up
```

If you prefer to run from the repository root, specify the compose file explicitly:

```bash
docker compose -f Backend/docker-compose.yml up --build
```

Notes
- The compose setup will read environment variables for the service; use `Backend/.env.example` as a template and **do not** commit your real `Backend/.env` file. If `Backend/.env` was previously committed, remove it from git tracking (`git rm --cached Backend/.env`) after adding it to `.gitignore`.
