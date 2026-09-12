from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
from django.db import models

class VoterManager(BaseUserManager):
    def create_user(self, voter_id, password=None, **extra_fields):
        if not voter_id:
            raise ValueError("Voter ID is required")

        user = self.model(voter_id=voter_id, **extra_fields)
        user.set_password(password)   # 🔐 hash password
        user.save()
        return user

    def create_superuser(self, voter_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(voter_id, password, **extra_fields)


class Voters(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=100)
    age = models.IntegerField(default=0)
    voter_id = models.CharField(max_length=20, unique=True)
    email_id = models.EmailField()
    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_verified = models.BooleanField(default=False)
    otp_created_at = models.DateTimeField(null=True, blank=True)
    face_encoding = models.BinaryField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    has_vote = models.BooleanField(default=False)   

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = VoterManager()

    USERNAME_FIELD = 'voter_id'
    REQUIRED_FIELDS = []
    
    def __str__(self):
        return self.name