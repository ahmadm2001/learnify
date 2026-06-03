from rest_framework import serializers
from core.models import Course
from .models import (
    Assignment,
    AssignmentSubmission,
    CartItem,
    Enrollment,
    CourseResource,
    CourseSection,
    Lecture,
    Assessment,
    LectureFile,
    Question,
    Choice,
    CourseReview,
)


# =====================================================
# 📎 LECTURE FILE SERIALIZER (MULTIPLE FILES)
# =====================================================
class LectureFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    original_name = serializers.SerializerMethodField()

    class Meta:
        model = LectureFile
        fields = [
            "id",
            "file_url",
            "original_name",
        ]

    def get_file_url(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.file.url)

    def get_original_name(self, obj):
        return obj.file.name.split("/")[-1]


# =====================================================
# COURSE RESOURCE (PDF)
# =====================================================
class CourseResourceSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = CourseResource
        fields = ["id", "title", "file_url", "uploaded_at"]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url


# =====================================================
# 🎥 LECTURE SERIALIZER (NEW)
# =====================================================
class LectureSerializer(serializers.ModelSerializer):
    video_link = serializers.SerializerMethodField()
    files = LectureFileSerializer(many=True, read_only=True)

    class Meta:
        model = Lecture
        fields = [
            "id",
            "title",
            "video_link",
            "files",
            "duration",
            "order",
            "is_preview",
            "is_live",
            "live_join_url",
            "scheduled_time",
            "live_started_at",
        ]

    def get_video_link(self, obj):
        request = self.context.get("request")
        if obj.video and request:
            return request.build_absolute_uri(obj.video.url)
        return obj.video_url


# =====================================================
# 📚 SECTION SERIALIZER (NEW)
# =====================================================
class CourseSectionSerializer(serializers.ModelSerializer):
    lectures = LectureSerializer(many=True, read_only=True)

    class Meta:
        model = CourseSection
        fields = ["id", "title", "order", "lectures"]


# =====================================================
# COURSE DETAIL
# =====================================================
class CourseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source="teacher.username", read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

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
            "rating",
            "reviews_count",
            "created_at",
            "is_enrolled",
        ]
        read_only_fields = [
            "id",
            "teacher",
            "teacher_name",
            "rating",
            "reviews_count",
            "created_at",
        ]

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        user = request.user if request else None

        if not user or not user.is_authenticated:
            return False

        return Enrollment.objects.filter(
            student=user,
            course=obj,
            status="APPROVED",
        ).exists()

    def get_reviews_count(self, obj):
        return obj.reviews.count()

    def to_representation(self, instance):
        """
        Hide intro video if student is NOT approved
        """
        data = super().to_representation(instance)

        if not data.get("is_enrolled"):
            data["intro_video_file"] = None
            data["intro_video_url"] = None

        return data


# =====================================================
# COURSE LIST (STUDENT LIST PAGE)
# =====================================================
class CourseListSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "thumbnail_url",
            "price",
            "rating",
            "reviews_count",
            "teacher_name",
        ]

    def get_teacher_name(self, obj):
        full = (obj.teacher.first_name or "").strip()
        if full and obj.teacher.last_name:
            full += " " + obj.teacher.last_name
        return full or obj.teacher.username

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return ""

    def get_reviews_count(self, obj):
        return obj.reviews.count()


# =====================================================
# CART
# =====================================================
class CartItemSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "course"]


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text", "is_correct"]


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = ["id", "text", "marks", "question_type", "choices"]

    def create(self, validated_data):
        choices_data = validated_data.pop("choices")
        question = Question.objects.create(**validated_data)

        for choice in choices_data:
            Choice.objects.create(question=question, **choice)

        return question


class AssessmentSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)
    max_attempts = serializers.IntegerField(default=2)

    class Meta:
        model = Assessment
        fields = ["id", "title", "description", "max_attempts", "lecture", "questions"]

    def create(self, validated_data):
        questions_data = validated_data.pop("questions", [])
        # ✅ FORCE DEFAULT IF NOT PROVIDED
        if "max_attempts" not in validated_data or not validated_data.get(
            "max_attempts"
        ):
            validated_data["max_attempts"] = 2  # You can change to 3 if you want
        assessment = Assessment.objects.create(**validated_data)

        for q_data in questions_data:
            choices_data = q_data.pop("choices", [])
            question = Question.objects.create(assessment=assessment, **q_data)

            if question.question_type == "MCQ":
                for c_data in choices_data:
                    Choice.objects.create(question=question, **c_data)

        return assessment

    def update(self, instance, validated_data):
        questions_data = validated_data.pop("questions", [])

        instance.title = validated_data.get("title", instance.title)
        instance.description = validated_data.get("description", instance.description)
        instance.max_attempts = validated_data.get(
            "max_attempts", instance.max_attempts
        )
        instance.save()

        # 🔥 DELETE OLD QUESTIONS (important)
        instance.questions.all().delete()

        # 🔁 RECREATE QUESTIONS
        for q_data in questions_data:
            choices_data = q_data.pop("choices", [])
            question = Question.objects.create(assessment=instance, **q_data)

            if question.question_type == "MCQ":
                for c_data in choices_data:
                    Choice.objects.create(question=question, **c_data)

        return instance


class AssignmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(
        source="lecture.section.course.title", read_only=True
    )

    teacher_name = serializers.CharField(
        source="lecture.section.course.teacher.username", read_only=True
    )

    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            "id",
            "lecture",
            "title",
            "instructions",
            "points",
            "due_date",
            "attachment",
            "attachment_url",
            "course_title",
            "teacher_name",
            "created_at",
        ]

    def get_attachment_url(self, obj):
        request = self.context.get("request")
        if obj.attachment and request:
            return request.build_absolute_uri(obj.attachment.url)
        return None


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.username", read_only=True)
    file = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentSubmission
        fields = ["id", "student_name", "file", "grade", "feedback", "submitted_at"]

    def get_file(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


# =====================================================
# 🛠 ADMIN COURSE LIST
# =====================================================
class AdminCourseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source="teacher.username", read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "price",
            "created_at",
            "teacher_name",
        ]


class CourseReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.username", read_only=True)

    class Meta:
        model = CourseReview
        fields = [
            "id",
            "student",
            "student_name",
            "course",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "student",
            "student_name",
            "course",
            "created_at",
            "updated_at",
        ]
