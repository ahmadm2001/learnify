"""Shared fixtures for the Learnify API test suite.

The suite is the automated translation of the manual test plan submitted
with the capstone project (chapter 13). Each test names the manual
scenario it mirrors.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from core.models import Course

User = get_user_model()

PASSWORD = "test-pass-123"


def _make_user(username, *, role="STUDENT", staff=False):
    user = User.objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password=PASSWORD,
        is_staff=staff,
    )
    # A post_save signal creates the profile; set the role explicitly.
    user.profile.role = role
    user.profile.save()
    return user


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def student(db):
    return _make_user("student1")


@pytest.fixture
def teacher(db):
    return _make_user("teacher1", role="TEACHER_APPROVED")


@pytest.fixture
def admin(db):
    return _make_user("admin1", role="ADMIN", staff=True)


@pytest.fixture
def course(teacher):
    return Course.objects.create(
        teacher=teacher,
        title="Intro to Python",
        description="A course used by the test suite.",
        price=0,
    )


@pytest.fixture
def as_student(api, student):
    api.force_authenticate(user=student)
    return api


@pytest.fixture
def as_teacher(api, teacher):
    api.force_authenticate(user=teacher)
    return api


@pytest.fixture
def as_admin(api, admin):
    api.force_authenticate(user=admin)
    return api
