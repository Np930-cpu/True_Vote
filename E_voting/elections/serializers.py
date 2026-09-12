from rest_framework import serializers
from .models import Election, Candidate

class electionserializer(serializers.ModelSerializer):
    class Meta:
        model = Election
        fields = '__all__'

class candidateserializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = '__all__'  # includes the new 'symbol' field automatically
