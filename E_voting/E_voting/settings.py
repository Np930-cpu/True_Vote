from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-insecure-key-change-me')

DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 't')

allowed_hosts_env = os.environ.get('ALLOWED_HOSTS', '*')
if allowed_hosts_env == '*':
    ALLOWED_HOSTS = ['*']
else:
    ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_env.split(',') if h.strip()]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'corsheaders',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',
    'users',
    'elections',
    'votes',
    'ai_detection',
    'blockchain',
    'rest_framework',
    'rest_framework_simplejwt',
    'face_auth',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'E_voting.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'E_voting.wsgi.application'

database_url = os.environ.get('DATABASE_URL')
if database_url:
    DATABASES = {
        'default': dj_database_url.config(default=database_url, conn_max_age=600)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'postgres'),
            'USER': os.environ.get('DB_USER', 'postgres'),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST': os.environ.get('DB_HOST', 'localhost'),
            'PORT': os.environ.get('DB_PORT', '5432'),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
}

AUTH_USER_MODEL = 'users.Voters'

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')

cors_allow_all = os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'True').lower() in ('true', '1', 't')
CORS_ALLOW_ALL_ORIGINS = cors_allow_all

cors_origins = os.environ.get('CORS_ALLOWED_ORIGINS', '')
if cors_origins:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in cors_origins.split(',') if o.strip()]

# Allow large face image uploads (15 frames × ~50KB each)
DATA_UPLOAD_MAX_MEMORY_SIZE = 20 * 1024 * 1024  # 20MB

csrf_trusted = os.environ.get('CSRF_TRUSTED_ORIGINS', '')
if csrf_trusted:
    CSRF_TRUSTED_ORIGINS = [o.strip() for o in csrf_trusted.split(',') if o.strip()]
else:
    CSRF_TRUSTED_ORIGINS = [
        'https://*.ngrok-free.dev',
        'https://*.ngrok.io',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]
