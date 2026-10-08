web: python manage.py migrate && python manage.py init_admin && gunicorn E_voting.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
