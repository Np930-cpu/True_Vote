from rest_framework import serializers
from .models import Voters

class voterserializer(serializers.ModelSerializer):
    class Meta:
        model = Voters
        fields = '__all__'