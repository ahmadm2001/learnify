#!/bin/bash
# Azure App Service startup command for the Learnify backend.
# Set this file as the App Service "Startup Command": bash startup.sh
set -e
cd backend
python manage.py collectstatic --noinput
python manage.py migrate --noinput
exec gunicorn server.wsgi --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120
