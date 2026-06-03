from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("STUDENT", "Student"),
        ("TEACHER_PENDING", "Teacher Pending"),
        ("TEACHER_APPROVED", "Teacher Approved"),
        ("ADMIN", "Admin"),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="STUDENT")
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)

     # NEW FIELDS
    phone = models.CharField(max_length=20, blank=True)
    id_number = models.CharField(max_length=50, blank=True)
    address = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class TeacherApplication(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="teacher_apps")

    # form fields
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=30)

    resume_file = models.FileField(upload_to="resumes/")  # PDF stored in media/resumes/
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.status} ({self.created_at:%Y-%m-%d})"


from django.utils import timezone
import random


class PasswordResetOTP(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="password_otps"
    )
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def is_expired(self):
        return self.created_at < timezone.now() - timezone.timedelta(minutes=10)

    def __str__(self):
        return f"{self.user.email} - {self.otp_code}"


class Subscriber(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email
