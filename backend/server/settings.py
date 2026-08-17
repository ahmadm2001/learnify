from pathlib import Path
import environ
import os

# --------------------------------------------------
# Base directory & .env
# --------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()
environ.Env.read_env(BASE_DIR / ".env")  # loads backend/.env

# --------------------------------------------------
# Core settings
# --------------------------------------------------
SECRET_KEY = env("SECRET_KEY", default="unsafe-dev")
DEBUG = env.bool("DEBUG", default=True)

ALLOWED_HOSTS = [
    h.strip()
    for h in env(
        "ALLOWED_HOSTS",
        default="127.0.0.1,localhost"
    ).split(",")
    if h
]

# HTTPS origins trusted for CSRF (needed behind Azure's proxy, e.g. the
# Django admin on https://<app>.azurewebsites.net). Comma separated.
CSRF_TRUSTED_ORIGINS = [
    o.strip()
    for o in env("CSRF_TRUSTED_ORIGINS", default="").split(",")
    if o.strip()
]

# --------------------------------------------------
# Installed apps
# --------------------------------------------------
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "corsheaders",

    # Local apps
    "core",
    "users",
    "courses",
    "social",
    "ide",
]

# --------------------------------------------------
# Middleware
# --------------------------------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # WhiteNoise serves collected static files directly from the app process,
    # so no separate web server is needed on Azure App Service.
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "server.urls"

# --------------------------------------------------
# Templates
# --------------------------------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],  
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "server.wsgi.application"

# --------------------------------------------------
# Database (PostgreSQL)
# --------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DB_NAME", default="fyp"),
        "USER": env("DB_USER", default="fyp_user"),
        "PASSWORD": env("DB_PASSWORD", default=env("DB_PASS", default="")),
        "HOST": env("DB_HOST", default="127.0.0.1"),
        "PORT": env("DB_PORT", default="5432"),
        # Azure Database for PostgreSQL requires TLS; local dev stays lenient.
        "OPTIONS": {"sslmode": env("DB_SSLMODE", default="prefer")},
    }
}

# --------------------------------------------------
# Password validation
# --------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --------------------------------------------------
# Internationalization
# --------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = False

# --------------------------------------------------
# Static & media
# --------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --------------------------------------------------
# CORS (Vite frontend)
# --------------------------------------------------
_default_cors = "http://localhost:5173,http://127.0.0.1:5173"
CORS_ALLOWED_ORIGINS = [
    o.strip()
    for o in env("CORS_ORIGINS", default=_default_cors).split(",")
    if o
]
CORS_ALLOW_CREDENTIALS = True

# --------------------------------------------------
# Django REST Framework + JWT
# --------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

# --------------------------------------------------
# Judge0 (Online Compiler) — Sprint 4
# --------------------------------------------------
JUDGE0_URL = env(
    "JUDGE0_URL",
    default="https://ce.judge0.com"
)


# --------------------------------------------------
# ZOOM CONFIG 🔥
# --------------------------------------------------
ZOOM_ACCOUNT_ID = env("ZOOM_ACCOUNT_ID", default="")
ZOOM_CLIENT_ID = env("ZOOM_CLIENT_ID", default="")
ZOOM_CLIENT_SECRET = env("ZOOM_CLIENT_SECRET", default="")


# --------------------------------------------------
# EMAIL CONFIG (for OTP + password reset)
# --------------------------------------------------
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True

EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")

DEFAULT_FROM_EMAIL = EMAIL_HOST_USER


OPENAI_API_KEY = env("OPENAI_API_KEY", default="")



