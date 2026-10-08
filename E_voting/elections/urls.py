from django.urls import path
from .views import (
    create_election, list_election, update_election, delete_election,
    register_candidate, list_candidate, update_candidate, delete_candidate
)

urlpatterns = [
    path('election/create/', create_election),
    path('election/', list_election),
    path('election/<int:election_id>/update/', update_election),
    path('election/<int:election_id>/delete/', delete_election),
    path('candidate/register/', register_candidate),
    path('candidate/', list_candidate),
    path('candidate/<int:candidate_id>/update/', update_candidate),
    path('candidate/<int:candidate_id>/delete/', delete_candidate),
]

