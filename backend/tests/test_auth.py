"""Authentication flow.

Mirrors manual tests 1-3 of the capstone test plan:
registration, login with valid credentials, login with wrong credentials.
"""

import pytest
from django.contrib.auth import get_user_model

from .conftest import PASSWORD

User = get_user_model()

REGISTER = "/api/auth/register/"
LOGIN = "/api/auth/token/"
ME = "/api/auth/me/"


@pytest.mark.django_db
class TestRegistration:
    """Manual test 1: creating a new account."""

    def test_register_creates_user(self, api):
        resp = api.post(
            REGISTER,
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "secret-123",
                "name": "New User",
            },
            format="json",
        )
        assert resp.status_code == 201
        assert User.objects.filter(username="newuser").exists()

    def test_register_rejects_short_password(self, api):
        resp = api.post(
            REGISTER,
            {"username": "u2", "email": "u2@example.com", "password": "123"},
            format="json",
        )
        assert resp.status_code == 400
        assert not User.objects.filter(username="u2").exists()

    def test_register_rejects_duplicate_username(self, api, student):
        resp = api.post(
            REGISTER,
            {
                "username": student.username,
                "email": "other@example.com",
                "password": "secret-123",
            },
            format="json",
        )
        assert resp.status_code == 400


@pytest.mark.django_db
class TestLogin:
    """Manual tests 2 and 3: valid and invalid credentials."""

    def test_login_with_valid_credentials_returns_tokens(self, api, student):
        resp = api.post(
            LOGIN,
            {"email": student.email, "password": PASSWORD},
            format="json",
        )
        assert resp.status_code == 200
        assert "access" in resp.data
        assert "refresh" in resp.data

    def test_login_with_wrong_password_is_rejected(self, api, student):
        resp = api.post(
            LOGIN,
            {"email": student.email, "password": "wrong-password"},
            format="json",
        )
        assert resp.status_code == 401
        assert "access" not in getattr(resp, "data", {})

    def test_access_token_grants_access_to_me(self, api, student):
        login = api.post(
            LOGIN,
            {"email": student.email, "password": PASSWORD},
            format="json",
        )
        api.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        resp = api.get(ME)
        assert resp.status_code == 200

    def test_me_requires_authentication(self, api):
        resp = api.get(ME)
        assert resp.status_code == 401
