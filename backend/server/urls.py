# backend/server/urls.py

from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path, include

from core.views import (
    health,
    CourseViewSet,
    MyCoursesListView,
    MyCourseDetailView,
    admin_dashboard,
    admin_all_users,
    admin_toggle_user_status,
    admin_delete_user,
    contact_us,
)
from users.views import (
    EmailLoginView,
    RegisterView,
    MeView,
    ProfileView,
    ApplyTeacherView,
    MyTeacherApplicationView,
    TeacherApplicationsListView,
    ApproveTeacherView,
    RejectTeacherView,
    # 🔥 THESE MUST EXIST
    SendOTPView,
    VerifyOTPView,
    ResetPasswordWithOTPView,
)

# -------------------------------------------------------------
# DRF Router (Course CRUD via ViewSet)
# /api/courses/
# -------------------------------------------------------------
router = DefaultRouter()
router.register(r"courses", CourseViewSet, basename="course")

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    # Router APIs → /api/courses/
    path("api/", include(router.urls)),
    # Health check
    path("api/health/", health),
    path("api/ide/", include("ide.urls")),
    path("api/contact/", contact_us),
    # -------------------------
    # AUTHENTICATION
    # -------------------------
    path("api/auth/register/", RegisterView.as_view()),
    path("api/auth/token/", EmailLoginView.as_view()),
    path("api/auth/refresh/", TokenRefreshView.as_view()),
    path("api/auth/me/", MeView.as_view()),
    # 🔥 OTP PASSWORD RESET
    path("api/auth/send-otp/", SendOTPView.as_view()),
    path("api/auth/verify-otp/", VerifyOTPView.as_view()),
    path("api/auth/reset-password/", ResetPasswordWithOTPView.as_view()),
    # Profile
    path("api/profile/", ProfileView.as_view()),
    # -------------------------
    # TEACHER APPLICATION
    # -------------------------
    path("api/teacher/apply/", ApplyTeacherView.as_view()),
    path("api/teacher/my-application/", MyTeacherApplicationView.as_view()),
    path("api/teacher/applications/", TeacherApplicationsListView.as_view()),
    path("api/teacher/applications/<int:pk>/approve/", ApproveTeacherView.as_view()),
    path("api/teacher/applications/<int:pk>/reject/", RejectTeacherView.as_view()),
    # -------------------------
    # INSTRUCTOR DASHBOARD APIs
    # -------------------------
    path("api/instructor/courses/", MyCoursesListView.as_view()),
    path("api/instructor/courses/<int:pk>/", MyCourseDetailView.as_view()),
    # -------------------------
    # ADMIN DASHBOARD APIs
    # -------------------------
    path("api/admin/dashboard/", admin_dashboard),
    path("api/admin/users/", admin_all_users),
    path("api/admin/users/<int:user_id>/toggle/", admin_toggle_user_status),
    path("api/admin/users/<int:user_id>/delete/", admin_delete_user),
    # -------------------------
    # COURSES app URLs
    # All extra endpoints (cart, enroll, pending, approve)
    #
    # This adds:
    #   /api/enroll/pending/
    #   /api/enroll/<id>/
    #   /api/enroll/approve/<id>/
    #   /api/cart/
    # -------------------------
    path("api/", include("users.urls")),
    path("api/social/", include("social.urls")),
    path("api/", include("courses.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
