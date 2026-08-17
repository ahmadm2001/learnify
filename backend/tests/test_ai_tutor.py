"""AI tutor endpoint.

Covers the input validation and configuration handling of the course
chatbot without calling the OpenAI API.
"""

import pytest
from django.test import override_settings

AI_CHAT = "/api/ai/chat/"


@pytest.mark.django_db
class TestAiTutor:
    def test_requires_authentication(self, api, course):
        resp = api.post(AI_CHAT, {"message": "hi", "course_id": course.id})
        assert resp.status_code == 401

    def test_rejects_empty_message(self, as_student, course):
        resp = as_student.post(
            AI_CHAT, {"message": "", "course_id": course.id}, format="json"
        )
        assert resp.status_code == 400

    def test_unknown_course_returns_404(self, as_student):
        resp = as_student.post(
            AI_CHAT, {"message": "hi", "course_id": 999999}, format="json"
        )
        assert resp.status_code == 404

    @override_settings(OPENAI_API_KEY="")
    def test_missing_api_key_returns_503_not_a_crash(self, as_student, course):
        resp = as_student.post(
            AI_CHAT, {"message": "hi", "course_id": course.id}, format="json"
        )
        assert resp.status_code == 503
        assert "not configured" in resp.data["detail"]
