# Mobile App Bachelor

A full-stack vehicle inspection application with an Expo mobile frontend and a FastAPI backend. The app supports photo-based assessments, user authentication, history tracking, and license plate recognition using an ANPR service.

## 🚀 Tech Stack

- Frontend: Expo + React Native + Expo Router
- Backend: FastAPI + Python
- Data store: MongoDB-compatible backend service
- ANPR / plate recognition: `nomeroff-net`
- Styling: Tailwind / Nativewind
- Auth: JWT access + refresh tokens
- Containerization: Docker / docker-compose

## 📁 Repository Structure

- `Frontend/` — Expo mobile app source, TypeScript migration, navigation, forms, history pages, and Redux API integration.
- `Backend/` — FastAPI application, auth, assessment endpoints, Docker configuration, and model downloader.
- `Backend/.env.example` — backend environment variables template.
- `Backend/credentials.json.example` — OAuth credentials template.
- `Backend/docker-compose.yml` — local backend service composition.
- `CONFIDENTIAL_INFO_GUIDE.md` — repository security and sensitive-data handling guidance.

## ✅ Features

- Camera upload flow for vehicle inspection
- License plate recognition and assessment recording
- User login and profile management
- History listing with detailed assessment results
- Secure backend API with JWT-based authentication
- Dockerized backend deployment with model caching

## ⚡ Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/rising-gale/mobile-app-bachelor.git
cd mobile-app-bachelor
```

### 2. Backend setup

```bash
cd Backend
cp .env.example .env
cp credentials.json.example credentials.json
```

Edit `Backend/.env` and `Backend/credentials.json` with your local secrets and OAuth credentials. Do not commit these files.

Build and run with Docker Compose:

```bash
docker compose up --build
```

The backend will start with FastAPI and download any required model weights on first startup.

### 3. Frontend setup

Open a second terminal:

```bash
cd Frontend
npm install
npm run start
```

Then launch the Expo app on your device or simulator.

## 🛠 Environment Variables

### Backend

Copy `Backend/.env.example` to `Backend/.env` and set:

- `MONGO_URI` — MongoDB connection string
- `PORT` — backend port
- `BAZA_GAI_API_KEY` — API key for external services
- any additional keys required by the backend

### Frontend

Copy `Frontend/.env.example` to `Frontend/.env` if your mobile app requires runtime secrets.

## 🔒 Security Notes

- `Backend/.env` and `Backend/credentials.json` are ignored by git.
- Use the example templates only as a local guide.
- Rotate credentials immediately if they are accidentally committed.

## 📦 Deployment Notes

- Use a persistent volume for backend model weights when deploying to the cloud.
- For production, supply secrets through your hosting platform rather than committing them.
- The backend exposes Swagger UI at `/docs` when running.

## 📚 More Information

- See `Backend/README.md` for detailed backend deployment, Docker usage, and API docs.
- Use `Frontend/README.md` for frontend-specific instructions and project details.

## 🧠 Project Status

- Merged `expo-upgrade-54` into `main`
- Backend and frontend are aligned to the latest Expo 54 / TypeScript work
- Sensitive credential files are excluded from git history where required

Enjoy building and refining the app!