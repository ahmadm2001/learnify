from rest_framework import serializers
from .models import Snippet

class SnippetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snippet
        fields = ["id", "language", "code", "last_run_status", "created_at"]
        read_only_fields = ["id", "created_at", "last_run_status"]
