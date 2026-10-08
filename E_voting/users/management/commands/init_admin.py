import os
from django.core.management.base import BaseCommand
from users.models import Voters


class Command(BaseCommand):
    help = "Automatically initialize or update default Admin superuser in the database."

    def handle(self, *args, **options):
        voter_id = os.environ.get('ADMIN_VOTER_ID', 'admin').strip()
        password = os.environ.get('ADMIN_PASSWORD', 'admin123').strip()
        email = os.environ.get('ADMIN_EMAIL', 'admin@truevote.app').strip()
        name = os.environ.get('ADMIN_NAME', 'System Administrator').strip()

        user, created = Voters.objects.get_or_create(
            voter_id=voter_id,
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

        if created:
            self.stdout.write(self.style.SUCCESS(
                f"Successfully created new cloud Superuser: {voter_id} (Password: {password})"
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f"Successfully updated existing Superuser: {voter_id} (Password: {password})"
            ))
