from django.contrib import admin
from .models import UserProfile, TeacherApplication


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role")
    search_fields = ("user__username", "user__email")


@admin.register(TeacherApplication)
class TeacherApplicationAdmin(admin.ModelAdmin):
    list_display = ("user", "first_name", "last_name", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("user__username", "user__email", "first_name", "last_name")
