from django.db import models

class Block(models.Model):
    index = models.IntegerField()
    voter_id = models.CharField(max_length=100)
    timestamp = models.DateTimeField()
    candidate_id = models.IntegerField()
    previous_hash = models.CharField(max_length=256)
    hash = models.CharField(max_length=256)

    def __str__(self):
        return f"Block {self.index}"