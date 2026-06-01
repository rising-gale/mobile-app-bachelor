# Confidential Information Setup Guide

This document explains which files contain confidential information that must be set up locally and should **never** be committed to the public repository.

## Overview

The repository contains `.example` template files for all configurations that require sensitive credentials. When cloning the repository, developers must create local versions of these files with actual credentials.

---

## Backend Setup

### 1. Environment Variables (`.env`)

**File**: `Backend/.env` (do NOT commit)  
**Template**: `Backend/.env.example`

Create your local `.env` file:
```bash
cp Backend/.env.example Backend/.env
```

Edit `Backend/.env` with your actual values:
- `SECRET_KEY` - JWT secret key (can be any secure random string)
- `SENDER_EMAIL` - Gmail address for sending confirmation emails
- `SENDER_PASS` - Google App Password (not your regular Gmail password)
- `MONGO_URI` - MongoDB connection string with credentials
- `BAZA_GAI_API_KEY` - API key for license plate database service

**Example:**
```
SECRET_KEY=your_random_secure_key_12345
ALGORITHM=HS256
CONFIRM_TOKEN_EXPIRE_DAYS=30
SENDER_EMAIL=your-email@gmail.com
SENDER_PASS=your_app_specific_password
CONFIRMATION_LINK=http://localhost:8080/user/confirm/
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
BAZA_GAI_API_KEY=your_actual_api_key_from_service
```

### 2. Google OAuth Credentials (Optional)

**File**: `Backend/credentials.json` (do NOT commit)  
**Template**: `Backend/credentials.json.example`

If your application uses Google OAuth, create:
```bash
cp Backend/credentials.json.example Backend/credentials.json
```

Replace with credentials from [Google Cloud Console](https://console.cloud.google.com/):
```json
{
  "installed": {
    "client_id": "your-client-id.apps.googleusercontent.com",
    "project_id": "your-project-id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "your-actual-client-secret",
    "redirect_uris": ["http://localhost:8080"]
  }
}
```

---

## Frontend Setup

### Environment Variables (`.env`)

**File**: `Frontend/.env` (do NOT commit)  
**Template**: `Frontend/.env.example`

Create your local `.env` file:
```bash
cp Frontend/.env.example Frontend/.env
```

Edit with your backend API URL:
```
EXPO_PUBLIC_API_URL=http://192.168.1.100:8080
```

---

## Git Configuration

These files are protected by `.gitignore`:
- `Backend/.env` - Backend environment variables
- `Backend/credentials.json` - Google OAuth credentials
- `Frontend/.env` - Frontend environment variables

If you accidentally committed any of these files, remove them from git history:
```bash
git rm --cached Backend/.env
git rm --cached Backend/credentials.json
git commit -m "Remove accidentally committed sensitive files"
```

---

## Docker Compose

The `Backend/docker-compose.yml` file references `Backend/.env`. To run with docker-compose:

```bash
cd Backend
docker compose up --build
```

The service will automatically load environment variables from `.env`.

---

## Environment-Specific Configuration

### Local Development
- Set all variables in local `.env` files
- Use `localhost` or `127.0.0.1` for database connections

### Docker
- Pass environment variables via `-e` flags or `.env` file
- Use container network names (e.g., `mongodb` instead of `localhost`)

### Cloud Deployment (Render, Fly, AWS ECS, etc.)
- Configure environment variables in the platform's dashboard
- Example for Render:
  - Dashboard → Environment → Add environment variables
  - `MONGO_URI`, `BAZA_GAI_API_KEY`, `SECRET_KEY`, `SENDER_EMAIL`, `SENDER_PASS`, etc.

---

## Security Best Practices

1. **Never commit credentials** - Use `.gitignore` and `.example` templates
2. **Use strong secrets** - Generate `SECRET_KEY` with `openssl rand -hex 32`
3. **Google passwords** - Use App Passwords, not your main Gmail password
4. **API keys** - Rotate periodically and use different keys for different environments
5. **MongoDB** - Use strong passwords and restrict network access in Atlas
6. **Code review** - Before committing, check for hardcoded credentials with:
   ```bash
   git diff --cached | grep -i "password\|secret\|api_key\|token"
   ```

---

## Troubleshooting

**"BAZA_GAI_API_KEY environment variable is not set"**
- Make sure `Backend/.env` exists and has `BAZA_GAI_API_KEY=...`
- When using docker-compose, ensure the `.env` file is in the `Backend/` directory

**MongoDB connection fails**
- Verify `MONGO_URI` in `.env` is correct
- Check that your IP is whitelisted in MongoDB Atlas (or disable IP restrictions for local dev)

**Google OAuth fails**
- Verify `credentials.json` is in `Backend/` directory
- Check that redirect URI matches in Google Cloud Console

---

## Questions?

Refer to the README files in each folder for more detailed setup instructions.
