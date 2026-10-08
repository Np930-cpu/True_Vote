import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'E_voting.settings')

application = get_wsgi_application()

# 🚀 Automated database migrations & initial setup for free cloud hosting (Render / Railway / etc.)
# This runs automatically on boot without requiring a paid interactive shell.
try:
    from django.core.management import call_command
    print("[TrueVote WSGI] Applying pending database migrations...")
    call_command('migrate', interactive=False)
    print("[TrueVote WSGI] Migrations successfully applied.")

    try:
        call_command('createcachetable')
        print("[TrueVote WSGI] Cache table initialized.")
    except Exception as cache_err:
        print(f"[TrueVote WSGI] Cache table note: {cache_err}")

    try:
        call_command('init_admin')
        print("[TrueVote WSGI] Admin user initialized.")
    except Exception as admin_err:
        print(f"[TrueVote WSGI] Admin init note: {admin_err}")

    try:
        from elections.models import Election
        if Election.objects.count() == 0:
            print("[TrueVote WSGI] Database is empty. Seeding initial elections & blockchain...")
            call_command('seed_data')
            print("[TrueVote WSGI] Database seeded successfully.")
    except Exception as seed_err:
        print(f"[TrueVote WSGI] Seeding note: {seed_err}")

except Exception as err:
    print(f"[TrueVote WSGI] Auto-migration notice: {err}")

