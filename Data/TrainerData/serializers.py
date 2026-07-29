from rest_framework import serializers
from .models import Trainer

class TrainerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trainer
        fields = '__all__'
        read_only_fields = ['id']
