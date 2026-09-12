from rest_framework import serializers
from .models import votes

class voteserializer(serializers.ModelSerializer):
    class Meta:
        model= votes
        fields= '__all__'