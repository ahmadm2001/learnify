"""Profile management.

Mirrors manual test 4 of the capstone test plan: editing profile details
and verifying the change is persisted.
"""

import pytest

PROFILE = "/api/profile/"


@pytest.mark.django_db
class TestProfile:
    def test_get_own_profile(self, as_student):
        resp = as_student.get(PROFILE)
        assert resp.status_code == 200

    def test_update_phone_and_address_persists(self, as_student, student):
        resp = as_student.put(
            PROFILE,
            {"phone": "050-1234567", "address": "Beer Sheva"},
            format="json",
        )
        assert resp.status_code == 200

        student.profile.refresh_from_db()
        assert student.profile.phone == "050-1234567"
        assert student.profile.address == "Beer Sheva"

    def test_password_change_requires_confirmation(self, as_student):
        resp = as_student.put(
            PROFILE,
            {"new_password": "brand-new-pass", "confirm_password": "different"},
            format="json",
        )
        assert resp.status_code == 400

    def test_profile_requires_authentication(self, api):
        resp = api.get(PROFILE)
        assert resp.status_code == 401
