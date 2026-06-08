import requests
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics
from django.conf import settings

from .models import Snippet
from .serializers import SnippetSerializer

# Judge0 language IDs
LANGUAGE_MAP = {
    "python": 71,
    "javascript": 63,
    "java": 62,
    "c": 50,
    "cpp": 54,
    "csharp": 51,
    "php": 68,
    "go": 60,
    "swift": 83,
}


class RunCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get("code", "")
        language = request.data.get("language", "")
        program_input = request.data.get("input", "")

        if not code or language not in LANGUAGE_MAP:
            return Response({"detail": "code + valid language required"}, status=400)

        payload = {
            "source_code": code,
            "language_id": LANGUAGE_MAP[language],
            "stdin": program_input,
        }

        headers = {
            "Content-Type": "application/json",
        }

        r = requests.post(
            f"{settings.JUDGE0_URL}/submissions?wait=true",
            json=payload,
            headers=headers,
            timeout=20,
        )

        return Response(r.json(), status=r.status_code)


class SnippetListCreateView(generics.ListCreateAPIView):
    serializer_class = SnippetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Snippet.objects.filter(owner=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
