from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from users.models import PasswordResetOTP


# =========================
# AUTH TESTS
# =========================
class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_user(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "testuser",
                "email": "test@test.com",
                "password": "123456",
            },
        )

        self.assertEqual(response.status_code, 201)

    def test_login_user(self):
        User.objects.create_user(
            username="testuser", email="test@test.com", password="123456"
        )

        response = self.client.post(
            "/api/auth/token/", {"email": "test@test.com", "password": "123456"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)


# =========================
# PROFILE TESTS
# =========================
class ProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="user1", email="user@test.com", password="123456"
        )

        res = self.client.post(
            "/api/auth/token/", {"email": "user@test.com", "password": "123456"}
        )

        self.token = res.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_get_profile(self):
        response = self.client.get("/api/profile/")
        self.assertEqual(response.status_code, 200)

    def test_update_profile(self):
        response = self.client.put(
            "/api/profile/",
            {
                "bio": "Updated bio",
                "phone": "999999",
            },
        )

        self.assertEqual(response.status_code, 200)


# =========================
# TEACHER APPLICATION TESTS
# =========================
class TeacherApplicationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="student", email="student@test.com", password="123456"
        )

        res = self.client.post(
            "/api/auth/token/", {"email": "student@test.com", "password": "123456"}
        )

        self.token = res.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_apply_teacher_fail(self):
        response = self.client.post("/api/teacher/apply/", {})
        self.assertEqual(response.status_code, 400)

    def test_get_my_application(self):
        response = self.client.get("/api/teacher/my-application/")
        self.assertEqual(response.status_code, 200)


# =========================
# OTP TESTS
# =========================
class OTPTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="otpuser", email="otp@test.com", password="123456"
        )

    def test_send_otp(self):
        response = self.client.post("/api/auth/send-otp/", {"email": "otp@test.com"})

        self.assertEqual(response.status_code, 200)
        self.assertTrue(PasswordResetOTP.objects.filter(user=self.user).exists())

    def test_verify_invalid_otp(self):
        response = self.client.post(
            "/api/auth/verify-otp/", {"email": "otp@test.com", "otp": "000000"}
        )

        self.assertEqual(response.status_code, 400)


# =========================
# PERMISSION TEST
# =========================
class PermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_profile_requires_auth(self):
        response = self.client.get("/api/profile/")
        self.assertEqual(response.status_code, 401)
