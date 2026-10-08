from rest_framework import serializers
from .models import Election, Candidate

class candidateserializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = '__all__'

class electionserializer(serializers.ModelSerializer):
    candidates_count = serializers.IntegerField(source='candidates.count', read_only=True)
    creator_name = serializers.CharField(source='creator.name', read_only=True, default='')
    creator_voter_id = serializers.CharField(source='creator.voter_id', read_only=True, default='')
    candidates = candidateserializer(many=True, read_only=True)

    class Meta:
        model = Election
        fields = [
            'id', 'name', 'category', 'organization', 'description',
            'start_date', 'end_date', 'creator', 'creator_name',
            'creator_voter_id', 'created_at', 'candidates_count', 'candidates'
        ]
        read_only_fields = ['creator', 'created_at']
