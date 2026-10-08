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
   - `ALLOW_DEV_OTP`: `True` *(Ensures OTP is returned in API response and auto-filled so voters are never blocked)*
   - `RESEND_API_KEY`: *(Optional: Free API key from [resend.com](https://resend.com) for real HTTPS email delivery on Render Free Tier)*
   - `BREVO_API_KEY`: *(Optional: Free API key from [brevo.com](https://brevo.com) for 300 free emails/day over HTTPS)*
   - `EMAIL_HOST_USER`: *(Your Gmail address for OTPs when running locally or on paid plan)*
   - `EMAIL_HOST_PASSWORD`: *(Your 16-character Google App Password)*

> [!NOTE]
> **Email Delivery on Render Free Tier**:
> Render Free Tier blocks outbound SMTP traffic (ports 25, 465, and 587) to prevent spam.
> To receive real emails on Render free tier, simply set `RESEND_API_KEY` or `BREVO_API_KEY` (which send over HTTPS port 443).
> If no email API is configured, `ALLOW_DEV_OTP=True` automatically displays and auto-fills the verification code directly in the registration/login form so users are never stuck.

5. Click **Create Web Service**.
6. **Automatic Migration & Initial Seeding**:
   - The backend is configured to **automatically run migrations, initialize the admin account (`Admin` / `admin123`), and populate initial elections** directly inside `wsgi.py` on container startup!
   - You **do NOT need Render's paid Shell feature**!
   - If you ever want to re-seed or reset sample elections, simply visit this URL in your web browser:
     ```text
     https://your-backend.onrender.com/api/elections/seed-data/
     ```
     This triggers migrations, creates the admin user, and loads realistic sample data in seconds.

---

## 4. Step 3: Deploy Frontend on Vercel

The project is pre-configured with `vercel.json` files for seamless one-click Vercel deployment.

### Method 1: Subfolder Import (Recommended)
1. In the [Vercel Dashboard](https://vercel.com), click **Add New...** -> **Project**.
2. Import your GitHub repository (`Np930-cpu/True_Vote` or your repo name).
3. In the project setup screen:
   - Click **Edit** next to **Root Directory** and select `E_voting/frontend`.
   - **Framework Preset**: `Vite` (automatically detected).
   - **Build Command**: `npm run build` (automatic).
   - **Output Directory**: `dist` (automatic).
4. Expand **Environment Variables** and add:
   - `VITE_API_BASE_URL`: `https://truevote-api.onrender.com` *(Your live Django backend URL, without trailing slash)*
5. Click **Deploy**.

### Method 2: Root Repository Import
If you do not change the Root Directory in Vercel, the root `vercel.json` will automatically build the frontend inside `E_voting/frontend` and serve `E_voting/frontend/dist` without extra configuration! Simply add `VITE_API_BASE_URL` in the Environment Variables and click **Deploy**.

### SPA Routing & Assets
Both `vercel.json` files contain rewrites (`/* -> /index.html`) so that React Router paths (`/login`, `/register`, `/elections`, `/vote`, `/admin/dashboard`) reload without 404 errors.

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
