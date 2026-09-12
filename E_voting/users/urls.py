from django.urls import path
from .views import (
    register_voter, send_otp, verify_otp, complete_registration,
    send_login_otp, verify_login_otp, voter_profile, admin_login
)

urlpatterns = [
    path('register/', register_voter),
    path('send-otp/', send_otp),
    path('verify-otp/', verify_otp),
    path('complete-registration/', complete_registration),
    path('send-login-otp/', send_login_otp),
    path('verify-login-otp/', verify_login_otp),
    path('profile/', voter_profile),
    path('admin-login/', admin_login),
]
