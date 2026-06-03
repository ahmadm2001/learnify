from django.db import models
from django.contrib.auth.models import User
from core.models import Course


# =====================================================
# CART
# =====================================================
class CartItem(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="cart_items",
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="cart_items",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "course")

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"


# =====================================================
# ENROLLMENT
# =====================================================
class Enrollment(models.Model):
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ("PENDING", "Pending"),
            ("APPROVED", "Approved"),
        ],
        default="PENDING",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student.username} - {self.course.title} ({self.status})"


# =====================================================
# COURSE PDF RESOURCES
# =====================================================
class CourseResource(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="resources",  # ✅ VERY IMPORTANT
    )
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="course_resources/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# =====================================================
# COURSE SECTIONS (Udemy style modules)
# =====================================================
class CourseSection(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="sections",
    )
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


# =====================================================
# LECTURES (Each video inside a section)
# =====================================================
class Lecture(models.Model):
    section = models.ForeignKey(
        CourseSection,
        on_delete=models.CASCADE,
        related_name="lectures",
    )
    title = models.CharField(max_length=255)

    video = models.FileField(upload_to="course_lectures/", blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)

    pdf = models.FileField(
        upload_to="lecture_pdfs/", blank=True, null=True
    )  # ✅ ADD THIS

    duration = models.CharField(max_length=20, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_preview = models.BooleanField(default=False)

    is_live = models.BooleanField(default=False)
    live_join_url = models.TextField(null=True, blank=True)
    live_start_url = models.TextField(null=True, blank=True)
    live_started_at = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    scheduled_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


# =====================================================
# ASSESSMENTS / QUIZZES
# =====================================================
class Assessment(models.Model):
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name="assessments",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    max_attempts = models.PositiveIntegerField(default=3)
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_assessments",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Question(models.Model):
    QUESTION_TYPES = (
        ("MCQ", "Multiple Choice"),
        ("TEXT", "Open Ended"),
    )

    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="questions",
    )
    text = models.TextField()
    marks = models.IntegerField(default=1)

    question_type = models.CharField(
        max_length=10,
        choices=QUESTION_TYPES,
        default="MCQ",
    )

    def __str__(self):
        return self.text[:50]


class Choice(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="choices",
    )
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text


class Attempt(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("GRADED", "Graded"),
    )

    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="attempts",
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="quiz_attempts",
    )

    score = models.IntegerField(default=0)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
    )

    graded_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.username} - {self.assessment.title}"


class Answer(models.Model):
    attempt = models.ForeignKey(
        Attempt,
        on_delete=models.CASCADE,
        related_name="answers",
    )
    question = models.ForeignKey(Question, on_delete=models.CASCADE)

    # MCQ
    selected_choice = models.ForeignKey(
        Choice,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    # OPEN ENDED
    answer_text = models.TextField(blank=True)

    # INSTRUCTOR GRADING
    marks_awarded = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = ("attempt", "question")

    def __str__(self):
        return f"Answer Q{self.question.id}"


# =====================================================
# ASSIGNMENTS
# =====================================================
class Assignment(models.Model):
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name="assignments",
    )
    title = models.CharField(max_length=255)
    instructions = models.TextField(blank=True)
    points = models.IntegerField(default=100)
    due_date = models.DateTimeField(null=True, blank=True)
    attachment = models.FileField(upload_to="assignments/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name="submissions",
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="assignment_submissions",
    )
    file = models.FileField(upload_to="assignment_submissions/")
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)

    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"


class LectureFile(models.Model):
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name="files")
    file = models.FileField(upload_to="lecture_files/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.lecture.title} - file"


class CourseReview(models.Model):
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="course_reviews",
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student.username} - {self.course.title} - {self.rating}"
