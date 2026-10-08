from django.urls import path
from .views import (
    create_election, list_election, register_candidate,
    list_candidate, delete_election
)

urlpatterns = [
    path('election/create/', create_election),
    path('election/', list_election),
    path('election/<int:election_id>/delete/', delete_election),
    path('candidate/register/', register_candidate),
    path('candidate/', list_candidate),
]

