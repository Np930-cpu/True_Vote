from django.urls import path
from .views import view_blockchain, check_blockchain

urlpatterns = [
    path('', view_blockchain),
    path('validate/', check_blockchain),
]