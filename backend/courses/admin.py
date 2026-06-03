from django.contrib import admin
from core.models import Course
from courses.models import (
    Enrollment,
    CartItem,
    CourseResource,
    Assessment,
    Question,
    Choice,
    Attempt,
    Answer,
    Assignment,
    AssignmentSubmission,
    Lecture,
)


# -------------------------
# Course
# -------------------------
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "teacher",
        "price",
        "rating",
        "created_at",
    )
    search_fields = ("title", "teacher__username")


# -------------------------
# Enrollment
# -------------------------
@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "course",
        "status",
        "created_at",
    )
    list_filter = ("status",)
    search_fields = ("student__username", "course__title")


# -------------------------
# CartItem
# -------------------------
@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("user", "course", "created_at")
    search_fields = ("user__username", "course__title")


# -------------------------
# CourseResource  ⭐ THIS WAS MISSING
# -------------------------
@admin.register(CourseResource)
class CourseResourceAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "course",
        "uploaded_at",
    )
    search_fields = ("title", "course__title")


# -------------------------
# Assessment (Quiz)
# -------------------------
@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ("title", "lecture", "created_by", "due_date", "max_attempts")
    search_fields = ("title", "lecture__title", "created_by__username")


# -------------------------
# Question
# -------------------------
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("text", "assessment", "marks")
    search_fields = ("text",)


# -------------------------
# Choice
# -------------------------
@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ("text", "question", "is_correct")
    list_filter = ("is_correct",)


# -------------------------
# Attempt (Student Quiz Attempt)
# -------------------------
@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = ("student", "assessment", "score", "submitted_at")
    search_fields = ("student__username", "assessment__title")


# -------------------------
# Answer (Student Answer)
# -------------------------
@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ("attempt", "question", "selected_choice")


# -------------------------
# Assignment
# -------------------------
@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ("title", "lecture", "points", "due_date", "created_at")


# -------------------------
# Assignment Submission
# -------------------------
@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ("assignment", "student", "submitted_at", "grade")


@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ("title", "section", "is_live")
    search_fields = ("title",)
