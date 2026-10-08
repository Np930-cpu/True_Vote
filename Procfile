web: python manage.py migrate && python manage.py createcachetable && python manage.py init_admin && gunicorn E_voting.wsgi:application --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 120
