from django.conf import settings
from django.db import models
from users.models import Voters
from elections.models import Candidate, Election


class votes(models.Model):
    voter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    election = models.ForeignKey(Election, on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Enforce one vote per voter per election at the database level
        unique_together = ('voter', 'election')

    def __str__(self):
        return f"{self.voter} Voted for {self.candidate}"
