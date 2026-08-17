"""Course catalogue, cart and enrolment listing.

Mirrors manual tests 5-7 of the capstone test plan: viewing the catalogue,
joining a course (cart step), and viewing "my courses".
Also covers the public health check endpoint.
"""

import pytest

from courses.models import CartItem

CATALOG = "/api/courses/"
CART = "/api/cart/"
MY_COURSES = "/api/enroll/my-courses/"
HEALTH = "/api/health/"


@pytest.mark.django_db
class TestCatalog:
    """Manual test 5: the catalogue lists available courses."""

    def test_catalog_lists_created_course(self, api, course):
        resp = api.get(CATALOG)
        assert resp.status_code == 200
        titles = [c["title"] for c in resp.data]
        assert course.title in titles

    def test_empty_catalog_returns_empty_list(self, api, db):
        resp = api.get(CATALOG)
        assert resp.status_code == 200
        assert resp.data == []


@pytest.mark.django_db
class TestCart:
    """Manual test 6, first step: adding a course to the cart."""

    def test_add_course_to_cart(self, as_student, student, course):
        resp = as_student.post(f"/api/cart/add/{course.id}/")
        assert resp.status_code in (200, 201)
        assert CartItem.objects.filter(user=student, course=course).exists()

    def test_adding_twice_does_not_duplicate(self, as_student, student, course):
        as_student.post(f"/api/cart/add/{course.id}/")
        as_student.post(f"/api/cart/add/{course.id}/")
        assert CartItem.objects.filter(user=student, course=course).count() == 1

    def test_cart_requires_authentication(self, api, course):
        resp = api.post(f"/api/cart/add/{course.id}/")
        assert resp.status_code == 401


@pytest.mark.django_db
class TestMyCourses:
    """Manual test 7: the student's own course list."""

    def test_my_courses_empty_for_new_student(self, as_student):
        resp = as_student.get(MY_COURSES)
        assert resp.status_code == 200


def test_health_endpoint(client, db):
    resp = client.get(HEALTH)
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
