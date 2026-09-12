from django.urls import path
from .views import cast_vote, result, dashboard, has_voted

urlpatterns = [
    path('vote/', cast_vote),
    path('results/<int:election_id>/', result),
    path('dashboard/', dashboard),
    path('has-voted/<int:election_id>/', has_voted),
]
