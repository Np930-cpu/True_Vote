from django.urls import path
from .views import create_election,list_election,register_candidate,list_candidate

urlpatterns = [
    path('election/create/',create_election),
    path('election/',list_election),
    path('candidate/register/',register_candidate),
    path('candidate/',list_candidate),
]

