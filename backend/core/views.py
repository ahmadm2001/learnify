# backend/core/views.py
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import viewsets, permissions, generics
from django.core.mail import send_mail
from django.conf import settings

from .models import Course
from .serializers import CourseSerializer
from users.permissions import IsTeacherOrAdmin


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok"})


class CourseViewSet(viewsets.ModelViewSet):
    """
    /api/courses/      - list/create courses
    /api/courses/<id>/ - retrieve/update/delete course
    For now:
      - Anyone can list/retrieve (view courses)
      - Only TEACHER_APPROVED or ADMIN can create/update/delete
    """

    queryset = Course.objects.all().order_by("-created_at")
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            # public read access
            return [permissions.AllowAny()]
        # mutate actions -> teacher or admin
        return [permissions.IsAuthenticated(), IsTeacherOrAdmin()]


class MyCoursesListView(generics.ListAPIView):
    """
    GET /api/instructor/courses/
    Returns only the courses created by the current teacher.
    """

    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrAdmin]

    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user).order_by("-created_at")


class MyCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/instructor/courses/<pk>/
    PUT/PATCH/DELETE /api/instructor/courses/<pk>/
    Only the owning teacher (or admin) can update/delete.
    """

    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrAdmin]
    lookup_url_kwarg = "pk"

    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user)


# ================= ADMIN DASHBOARD API =================

from django.contrib.auth import get_user_model
from django.db.models import Sum

# ⚠️ FIX THIS IMPORT IF NEEDED
# If TeacherApplication is in another app, tell me I fix it
try:
    from core.models import TeacherApplication
except:
    TeacherApplication = None

User = get_user_model()


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def admin_dashboard(request):
    # only admin allowed
    if not request.user.is_staff:
        return Response({"error": "Unauthorized"}, status=403)

    total_users = User.objects.count()

    # handle if model not found
    if TeacherApplication:
        total_apps = TeacherApplication.objects.count()
        approved = TeacherApplication.objects.filter(status="APPROVED").count()
        pending = TeacherApplication.objects.filter(status="PENDING").count()
        rejected = TeacherApplication.objects.filter(status="REJECTED").count()
    else:
        total_apps = approved = pending = rejected = 0

    courses = Course.objects.all()
    total_courses = courses.count()
    published = courses.count()

    revenue = courses.aggregate(total=Sum("price"))["total"] or 0

    return Response(
        {
            "total_users": total_users,
            "approved_teachers": approved,
            "pending_apps": pending,
            "rejected_apps": rejected,
            "total_courses": total_courses,
            "published_courses": published,
            "revenue": revenue,
        }
    )


from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def admin_all_users(request):
    if not request.user.is_staff:
        return Response({"error": "Unauthorized"}, status=403)

    users = User.objects.all().order_by("-id")

    data = []
    for user in users:
        data.append(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "is_staff": user.is_staff,
            }
        )

    return Response(data)


@api_view(["PATCH"])
@permission_classes([permissions.IsAuthenticated])
def admin_toggle_user_status(request, user_id):
    if not request.user.is_staff:
        return Response({"error": "Unauthorized"}, status=403)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    if user.id == request.user.id:
        return Response({"error": "You cannot disable yourself"}, status=400)

    user.is_active = not user.is_active
    user.save()

    return Response(
        {
            "message": "User status updated successfully",
            "is_active": user.is_active,
        }
    )


@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated])
def admin_delete_user(request, user_id):
    if not request.user.is_staff:
        return Response({"error": "Unauthorized"}, status=403)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    if user.id == request.user.id:
        return Response({"error": "You cannot delete yourself"}, status=400)

    user.delete()
    return Response({"message": "User deleted successfully"})

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

@api_view(["POST"])
@permission_classes([AllowAny])
def contact_us(request):
    first_name = request.data.get("first_name", "").strip()
    last_name = request.data.get("last_name", "").strip()
    email = request.data.get("email", "").strip()
    phone = request.data.get("phone", "").strip()
    message = request.data.get("message", "").strip()

    if not first_name or not last_name or not email or not message:
        return Response(
            {"error": "First name, last name, email, and message are required."},
            status=400,
        )

    context = {
        "first_name": first_name,
        "last_name": last_name,
        "sender_email": email,
        "phone": phone,
        "message": message,
    }

    html_message = render_to_string("emails/contact_message.html", context)
    plain_message = strip_tags(html_message)

    subject = f"New Contact Message from {first_name} {last_name}"

    email_msg = EmailMultiAlternatives(
        subject=subject,
        body=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=["learnifyam@gmail.com"],
        reply_to=[email] if email else None,
    )
    email_msg.attach_alternative(html_message, "text/html")
    email_msg.send(fail_silently=False)

    return Response({"message": "Email sent successfully"})
