# backend/core/serializers.py
from rest_framework import serializers
from .models import Course
from courses.models import Enrollment   # ← IMPORTANT


class CourseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source="teacher.username", read_only=True)

    # NEW FIELD → tells frontend that student is enrolled
    is_enrolled = serializers.SerializerMethodField()

    # 👇 aliases so the frontend can send video_file / video_url
    video_file = serializers.FileField(
        source="intro_video_file",
        allow_null=True,
        required=False,
        write_only=True,
    )
    video_url = serializers.CharField(
        source="intro_video_url",
        allow_blank=True,
        required=False,
        write_only=True,
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "teacher",
            "teacher_name",
            "title",
            "description",
            "price",
            "thumbnail",
            "course_type",
            "category",
            "time_per_week",
            "intro_video_file",
            "intro_video_url",
            "video_file",
            "video_url",
            "rating",
            "created_at",
            "is_enrolled",  # ← ADD THIS
        ]
        read_only_fields = [
            "id",
            "teacher",
            "teacher_name",
            "rating",
            "created_at",
            "intro_video_file",
            "intro_video_url",
            "is_enrolled",
        ]

    # 🟣 This checks if the current user is APPROVED in this course
    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        return Enrollment.objects.filter(
            student=user,
            course=obj,
            status="APPROVED"
        ).exists()

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["teacher"] = request.user
        return super().create(validated_data)
