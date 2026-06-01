# Backend (FastAPI) — Docker deployment

This folder contains the FastAPI backend for the project and Docker configuration to run it in a container.

**⚠️ Important Security Notes**
- **Credentials and environment variables**: Do NOT commit actual credentials or sensitive API keys to the repository. Use `.env.example` and `credentials.json.example` as templates.
- The `credentials.json` file (if needed for OAuth) should be created locally and is excluded from git tracking.
- All API keys must be provided via environment variables at runtime.

Key points
- The ANPR model uses the open-source `nomeroff-net` package (installed from GitHub).
- Model weights are not committed to the repository. The container will attempt to download and cache them on first start into `/app/models`.
- For cloud deployments, mount a persistent volume to `/app/models` or adapt `scripts/ensure_model.py` to use object storage.

## Setup

### 1. Create local environment files

Create a `.env` file from `.env.example`:
```bash
cp Backend/.env.example Backend/.env
# Edit Backend/.env with your actual credentials
```

If using Google OAuth, create `credentials.json` from the example:
```bash
cp Backend/credentials.json.example Backend/credentials.json
# Replace with your actual Google OAuth credentials
```

### 2. Build and run with Docker

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
  -e BAZA_GAI_API_KEY='your_actual_api_key_here' \
  mobile-backend:latest
```

If you prefer to mount a host folder to inspect weights:
```bash
docker run -it --rm -p 8080:8080 \
  -v "$(pwd)/Backend/models":/app/models \
  -e MONGO_URI='mongodb://host.docker.internal:27017' \
  -e BAZA_GAI_API_KEY='your_actual_api_key_here' \
  mobile-backend:latest
```

Health check
- The container runs `scripts/ensure_model.py` on startup to ensure `nomeroff-net` is installed and weights are cached. Check the container logs for `ensure_model: done` and a file `/app/models/.nomeroff_ready`.

Notes for cloud deploy
- Services like Render, Fly, or AWS ECS can run the built image. Ensure you provide persistence for `/app/models` or pre-bake weights into the image (not recommended for repo size reasons).
- Set all required environment variables (`MONGO_URI`, `BAZA_GAI_API_KEY`, etc.) in your cloud platform's secrets or environment configuration.

## Using docker-compose

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

**Important**: The compose setup will read environment variables from `Backend/.env`. Make sure this file exists locally with your actual credentials:
- Never commit `.env` to the repository (it's in `.gitignore`)
- Use `Backend/.env.example` as a template

API documentation
-----------------

FastAPI provides interactive API docs (Swagger UI) at `http://<host>:<port>/docs` and ReDoc at `/redoc` when the server is running. The OpenAPI spec is served at `/openapi.json`.

Authentication (access + refresh tokens)
--------------------------------------

The backend issues short-lived JWT access tokens and long-lived refresh tokens. The auth endpoints are:

- `POST /token` — exchange username & password for an access token and a refresh token. Returns standard OAuth2-like JSON:

```json
{
  "access_token": "...",
  "token_type": "bearer",
  "expires_in": 900,
  "refresh_token": "..."
}
```

- `POST /token/refresh` — send `{"refresh_token": "..."}` to obtain a new access token and a rotated refresh token.

- `POST /token/revoke` — send `{"refresh_token": "..."}` to revoke a refresh token.

Store refresh tokens in a secure platform storage on mobile (Keychain / EncryptedSharedPreferences). Access tokens may be kept in memory and renewed using the refresh token.
