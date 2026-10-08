from django.db import models
from django.conf import settings

CATEGORY_CHOICES = [
    ('college', 'College / University'),
    ('school', 'School'),
    ('club', 'Club & Society'),
    ('local', 'Local Community'),
    ('general', 'General'),
]

class Election(models.Model):
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    organization = models.CharField(max_length=150, blank=True, default='', help_text='School, college, club, or local body name')
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_elections',
        help_text='User who organized this election'
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.category})"
    
class Candidate(models.Model):
    name = models.CharField(max_length=100)
    party = models.CharField(max_length=100)
    symbol = models.CharField(max_length=10, default='🏛️', help_text='Party symbol emoji (e.g. 🌹, 🌻, ⚡, 🦁)')
    manifesto = models.TextField()
    election = models.ForeignKey(Election, on_delete=models.CASCADE, related_name='candidates')

    def __str__(self):
        return self.name
