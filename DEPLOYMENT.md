# TrueVote — Deployment & Production Guide

This guide walks you through deploying the TrueVote E-Voting System to live cloud platforms (e.g., Render/Railway for backend, Neon/Supabase for PostgreSQL, and Vercel/Netlify for frontend).

---

## 1. Architecture Overview

- **Backend**: Django 5 + Django REST Framework + Gunicorn + WhiteNoise
- **Database**: Hosted PostgreSQL (Neon / Supabase / Render Postgres)
- **Frontend**: React + Vite + Axios (Hosted on Vercel / Netlify)
- **Security**: Face recognition (OpenCV), SHA-256 Blockchain audit trail, AI fraud detection, JWT authentication.

---

## 2. Step 1: Set Up Hosted PostgreSQL Database

You can get a free managed PostgreSQL database from **[Neon.tech](https://neon.tech)**, **[Supabase](https://supabase.com)**, or **[Render](https://render.com)**.

1. Create a new PostgreSQL database instance.
2. Copy the connection string (`DATABASE_URL`), which looks like:
   ```text
   postgres://username:password@ep-sample-123.us-east-2.aws.neon.tech/vote_db?sslmode=require
   ```

---

## 3. Step 2: Deploy Backend (e.g. on Render / Railway)

### Option A: Deploying on [Render.com](https://render.com)
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `E_voting`
   - **Environment**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate
     ```
   - **Start Command**:
     ```bash
     gunicorn E_voting.wsgi:application --bind 0.0.0.0:$PORT
     ```
4. Add **Environment Variables** in the Render dashboard:
   - `SECRET_KEY`: *(Generate a secure random string)*
   - `DEBUG`: `False`
   - `DATABASE_URL`: *(Paste your Neon/Supabase connection string)*
   - `ALLOWED_HOSTS`: `*` *(or your render domain, e.g. `truevote-api.onrender.com`)*
   - `CORS_ALLOW_ALL_ORIGINS`: `False`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
   - `CSRF_TRUSTED_ORIGINS`: `https://your-frontend.vercel.app,https://truevote-api.onrender.com`
   - `EMAIL_HOST_USER`: *(Your Gmail address for OTPs)*
   - `EMAIL_HOST_PASSWORD`: *(Your 16-character Google App Password)*
5. Click **Create Web Service**.
6. Once deployed, open the Render **Shell** tab and run:
   ```bash
   python manage.py seed_data
   ```
   *(This populates the database with fresh elections, candidates, and sample data!)*

---

## 4. Step 3: Deploy Frontend (e.g. on Vercel / Netlify)

### Deploying on [Vercel](https://vercel.com)
1. In Vercel Dashboard, click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Root Directory**: `E_voting/frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://truevote-api.onrender.com` *(Your live Render backend URL, without trailing slash)*
5. Click **Deploy**.

> [!IMPORTANT]
> **HTTPS Requirement for Face Recognition**:
> Web browsers only grant camera access (`getUserMedia`) over HTTPS or localhost. Both Vercel and Render automatically provide free SSL certificates (`https://`), ensuring camera and face authentication work out-of-the-box.

---

## 5. Local Development vs. Production

| Environment | Backend URL | Database | Settings Source |
| :--- | :--- | :--- | :--- |
| **Local** | `http://127.0.0.1:8000` (via Vite proxy) | Local PostgreSQL (`localhost:5432`) | `E_voting/.env` |
| **Live** | `https://your-backend.onrender.com` | Cloud PostgreSQL (`DATABASE_URL`) | Cloud Platform Dashboard |

---

## 6. Maintenance & Seeding

To reset the database or re-seed fresh elections at any time on your live server:
```bash
python manage.py seed_data
```
This preserves superusers (`admin` / `admin123`), clears old votes, and inserts 3 fresh elections (Active, Upcoming, and Ended) with blockchain records.
