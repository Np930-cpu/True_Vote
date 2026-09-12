from django.db import models

class Election(models.Model):
    name=models.CharField(max_length=100)
    description=models.TextField()
    start_date=models.DateField()
    end_date=models.DateField()
    def __str__(self):
        return self.name
    
class Candidate(models.Model):
    name=models.CharField(max_length=100)
    party=models.CharField(max_length=100)
    symbol=models.CharField(max_length=10, default='🏛️', help_text='Party symbol emoji (e.g. 🌹, 🌻, ⚡, 🦁)')
    manifesto=models.TextField()
    election=models.ForeignKey(Election,on_delete=models.CASCADE)

    def __str__(self):
        return self.name
