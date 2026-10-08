import os
from django.core.management.base import BaseCommand
from users.models import Voters


class Command(BaseCommand):
    help = "Automatically initialize or update default Admin superuser in the database."

    def handle(self, *args, **options):
        raw_id = (os.environ.get('ADMIN_VOTER_ID') or 'Admin').strip() or 'Admin'
        password = (os.environ.get('ADMIN_PASSWORD') or 'admin123').strip() or 'admin123'
        email = (os.environ.get('ADMIN_EMAIL') or 'admin@truevote.app').strip() or 'admin@truevote.app'
        name = (os.environ.get('ADMIN_NAME') or 'System Administrator').strip() or 'System Administrator'

        # Provision both uppercase and lowercase so case-sensitivity never locks out the admin
        ids_to_sync = {raw_id, raw_id.lower(), raw_id.capitalize(), 'Admin', 'admin'}
        for vid in ids_to_sync:
            user, created = Voters.objects.get_or_create(
                voter_id=vid,
                defaults={
                    'name': name,
                    'email_id': email,
                    'is_staff': True,
                    'is_superuser': True,
                    'is_verified': True,
                    'otp_verified': True,
                }
            )
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.is_verified = True
            user.otp_verified = True
            user.save()

        self.stdout.write(self.style.SUCCESS(
            f"Successfully configured Admin superusers ({', '.join(sorted(ids_to_sync))}). Password set."
        ))
