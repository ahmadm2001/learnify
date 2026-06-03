# core/models.py

from django.db import models
from django.conf import settings


class Course(models.Model):
    COURSE_TYPE_CHOICES = [
        ("COURSE", "Course"),
        ("PRACTICE_TEST", "Practice test"),
    ]

    # who owns / created the course
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses",
    )

    # main info
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    # thumbnail image
    thumbnail = models.ImageField(
        upload_to="course_thumbnails/", blank=True, null=True
    )

    # Udemy-style wizard meta info
    course_type = models.CharField(
        max_length=20, choices=COURSE_TYPE_CHOICES, default="COURSE"
    )
    category = models.CharField(max_length=120, blank=True)

    # e.g. "0-2 hours", "2-5 hours"
    time_per_week = models.CharField(max_length=120, blank=True)

    # intro video: either uploaded file OR external link
    # 🔹 These are the real DB fields.
    intro_video_file = models.FileField(
        upload_to="course_videos/", blank=True, null=True
    )
    intro_video_url = models.URLField(blank=True)

    rating = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
