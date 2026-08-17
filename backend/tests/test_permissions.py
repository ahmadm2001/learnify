"""Role-based access control.

Mirrors manual test 20 of the capstone test plan (a student must not reach
instructor functionality) and the admin-only guarantees behind manual
tests 17-19 (teacher applications, user management, course management).
"""

import pytest

INSTRUCTOR_COURSES = "/api/instructor/courses/"
ADMIN_USERS = "/api/admin/users/"
ADMIN_DASHBOARD = "/api/admin/dashboard/"
TEACHER_APPLICATIONS = "/api/teacher/applications/"


@pytest.mark.django_db
class TestInstructorAccess:
    """Manual test 20: instructor pages are blocked for students."""

    def test_student_cannot_list_instructor_courses(self, as_student):
        resp = as_student.get(INSTRUCTOR_COURSES)
        assert resp.status_code == 403

    def test_approved_teacher_can_list_instructor_courses(self, as_teacher):
        resp = as_teacher.get(INSTRUCTOR_COURSES)
        assert resp.status_code == 200

    def test_anonymous_cannot_list_instructor_courses(self, api, db):
        resp = api.get(INSTRUCTOR_COURSES)
        assert resp.status_code == 401


@pytest.mark.django_db
class TestAdminAccess:
    """Admin-only endpoints behind manual tests 17-19."""

    def test_student_cannot_list_all_users(self, as_student):
        resp = as_student.get(ADMIN_USERS)
        assert resp.status_code == 403

    def test_staff_can_list_all_users(self, as_admin):
        resp = as_admin.get(ADMIN_USERS)
        assert resp.status_code == 200
        assert isinstance(resp.data, list)

    def test_student_cannot_view_admin_dashboard(self, as_student):
        resp = as_student.get(ADMIN_DASHBOARD)
        assert resp.status_code == 403

    def test_staff_can_view_admin_dashboard(self, as_admin):
        resp = as_admin.get(ADMIN_DASHBOARD)
        assert resp.status_code == 200
        assert "total_users" in resp.data
