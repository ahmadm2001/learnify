from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.template.loader import render_to_string
from django.contrib.auth.models import User
from django.core.mail import EmailMultiAlternatives, send_mail
from django.conf import settings
from .models import Subscriber
from .serializers import (
    RegisterSerializer,
    MeSerializer,
    TeacherApplicationSerializer,
    EmailTokenObtainPairSerializer,
)

from .models import TeacherApplication, PasswordResetOTP

import random


# ============================
# AUTH
# ============================


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            # 🔥 SEND WELCOME EMAIL (HTML TEMPLATE)
            try:
                html_content = render_to_string(
                    "emails/register_welcome.html",
                    {
                        "username": user.username,
                        "login_link": "http://localhost:5173/login",
                    },
                )

                msg = EmailMultiAlternatives(
                    subject="Welcome to Learnify 🎉",
                    body="Welcome to Learnify!",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[user.email],
                )

                msg.attach_alternative(html_content, "text/html")
                msg.send()

            except Exception as e:
                print("Register email error:", e)

            return Response(
                {"message": "User registered successfully"},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailLoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        # ✅ ONLY SEND EMAIL IF LOGIN SUCCESS
        if response.status_code == 200:
            email = request.data.get("email")

            if email:
                try:
                    user = User.objects.get(email=email)

                    # ✅ LOAD HTML TEMPLATE
                    html_content = render_to_string(
                        "emails/login_alert.html",
                        {
                            "username": user.username,
                            "reset_link": "http://localhost:5173/forgot-password",
                        },
                    )

                    # ✅ SEND EMAIL
                    msg = EmailMultiAlternatives(
                        subject="Login Alert 🔐",
                        body="Login detected on your account.",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[email],
                    )

                    msg.attach_alternative(html_content, "text/html")
                    msg.send()

                except Exception as e:
                    print("Login email error:", e)

        return response


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user).data, status=200)


# ============================
# PROFILE
# ============================


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user).data)

    def put(self, request):
        user = request.user
        profile = user.profile
        data = request.data

        # =========================
        # UPDATE USER FIELDS
        # =========================
        for field in ["first_name", "last_name", "email", "username"]:
            if field in data and data[field] != "":
                setattr(user, field, data[field])

        # =========================
        # PASSWORD CHANGE
        # =========================
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if new_password:
            if len(new_password) < 6:
                return Response({"detail": "Password too short"}, status=400)

            if new_password != confirm_password:
                return Response({"detail": "Passwords do not match"}, status=400)

            user.set_password(new_password)

        # =========================
        # UPDATE PROFILE FIELDS
        # =========================
        for field in ["bio", "phone", "id_number", "address", "avatar_url"]:
            if field in data:
                setattr(profile, field, data[field])

        user.save()
        profile.save()

        # =========================
        # 🔥 SEND EMAIL NOTIFICATION
        # =========================
        try:
            html_content = render_to_string(
                "emails/profile_updated.html",
                {
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "phone": profile.phone,
                    "address": profile.address,
                },
            )

            msg = EmailMultiAlternatives(
                subject="Profile Updated Successfully ✨",
                body="Your profile was updated successfully.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
            )

            msg.attach_alternative(html_content, "text/html")
            msg.send()

        except Exception as e:
            print("Profile email error:", e)

        return Response(MeSerializer(user).data, status=200)


# ============================
# TEACHER APPLICATION
# ============================


class ApplyTeacherView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        first_name = (request.data.get("first_name") or "").strip()
        last_name = (request.data.get("last_name") or "").strip()
        email = (request.data.get("email") or "").strip()
        phone = (request.data.get("phone") or "").strip()
        resume = request.FILES.get("resume_file")

        # ✅ Validation
        if not all([first_name, last_name, email, phone, resume]):
            return Response({"detail": "All fields required"}, status=400)

        if not resume.name.lower().endswith(".pdf"):
            return Response({"detail": "Resume must be PDF"}, status=400)

        # ✅ Save
        app = TeacherApplication.objects.create(
            user=request.user,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            resume_file=resume,
            status="PENDING",
        )

        # ✅ Update role
        request.user.profile.role = "TEACHER_PENDING"
        request.user.profile.save()

        # =========================
        # 🔥 EMAIL TO ADMIN
        # =========================
        try:
            html_content = render_to_string(
                "emails/teacher_application.html",
                {
                    "username": request.user.username,
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "phone": phone,
                },
            )

            msg = EmailMultiAlternatives(
                subject="New Teacher Application 🧑‍🏫",
                body="New teacher application received",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=["learnifyam@gmail.com"],  # 👈 change admin email
            )

            msg.attach_alternative(html_content, "text/html")
            msg.send()

        except Exception as e:
            print("Admin email error:", e)

        # =========================
        # 🔥 EMAIL TO USER (UPDATED HTML)
        # =========================
        try:
            html_content = render_to_string(
                "emails/application_submitted.html",
                {
                    "username": request.user.username,
                },
            )

            msg = EmailMultiAlternatives(
                subject="Application Submitted 🎉",
                body="Application submitted",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[request.user.email],
            )

            msg.attach_alternative(html_content, "text/html")
            msg.send()

        except Exception as e:
            print("User email error:", e)

        return Response(
            {"message": "Application submitted", "id": app.id},
            status=201,
        )


class MyTeacherApplicationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        app = TeacherApplication.objects.filter(user=request.user).last()

        if not app:
            return Response({"has_application": False})

        data = TeacherApplicationSerializer(app, context={"request": request}).data
        data["has_application"] = True
        return Response(data)


class TeacherApplicationsListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        apps = TeacherApplication.objects.all()
        serializer = TeacherApplicationSerializer(
            apps, many=True, context={"request": request}
        )
        return Response(serializer.data)


class ApproveTeacherView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            app = TeacherApplication.objects.get(pk=pk)
        except TeacherApplication.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        app.status = "APPROVED"
        app.save()

        app.user.profile.role = "TEACHER_APPROVED"
        app.user.profile.save()

        # =========================
        # 🔥 SEND APPROVAL EMAIL
        # =========================
        try:
            html_content = render_to_string(
                "emails/application_approved.html",
                {
                    "username": app.user.username,
                },
            )

            msg = EmailMultiAlternatives(
                subject="Application Approved 🎉",
                body="Approved",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[app.user.email],
            )

            msg.attach_alternative(html_content, "text/html")
            msg.send()

        except Exception as e:
            print("Approve email error:", e)

        return Response({"message": "Approved"})


class RejectTeacherView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            app = TeacherApplication.objects.get(pk=pk)
        except TeacherApplication.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        app.status = "REJECTED"
        app.save()

        app.user.profile.role = "STUDENT"
        app.user.profile.save()

        # =========================
        # 🔥 SEND REJECTION EMAIL
        # =========================
        try:
            html_content = render_to_string(
                "emails/application_rejected.html",
                {
                    "username": app.user.username,
                },
            )

            msg = EmailMultiAlternatives(
                subject="Application Update ❌",
                body="Rejected",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[app.user.email],
            )

            msg.attach_alternative(html_content, "text/html")
            msg.send()

        except Exception as e:
            print("Reject email error:", e)

        return Response({"message": "Rejected"})


# ============================
# PASSWORD RESET (OTP)
# ============================

from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives


class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()

        if not email:
            return Response({"detail": "Email required"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=400)

        # 🔥 DELETE OLD OTP
        PasswordResetOTP.objects.filter(user=user).delete()

        # 🔥 GENERATE OTP
        otp = str(random.randint(100000, 999999))

        PasswordResetOTP.objects.create(user=user, otp_code=otp)

        try:
            # ✅ LOAD TEMPLATE
            html_content = render_to_string(
                "emails/otp_email.html",
                {
                    "username": user.username,
                    "otp": otp,
                },
            )

            # ✅ SEND EMAIL
            msg = EmailMultiAlternatives(
                subject="Your OTP Code 🔐",
                body=f"Your OTP is {otp}",  # fallback
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email],
            )

            msg.attach_alternative(html_content, "text/html")
            msg.send()

        except Exception as e:
            print("OTP email error:", e)

        return Response({"message": "OTP sent"})


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        otp = request.data.get("otp", "").strip()

        try:
            user = User.objects.get(email=email)
            record = PasswordResetOTP.objects.filter(
                user=user, otp_code=otp, is_verified=False
            ).last()
        except Exception as e:
            print("OTP verify error:", e)
            return Response({"detail": "Invalid OTP"}, status=400)

        if not record:
            return Response({"detail": "Invalid OTP"}, status=400)

        if record.is_expired():
            return Response({"detail": "OTP expired"}, status=400)

        record.is_verified = True
        record.save()

        return Response({"message": "OTP verified"})


class ResetPasswordWithOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        # ✅ VALIDATION
        if not password or not confirm_password:
            return Response({"detail": "Password required"}, status=400)

        if password != confirm_password:
            return Response({"detail": "Passwords do not match"}, status=400)

        try:
            user = User.objects.get(email=email)
            record = PasswordResetOTP.objects.filter(user=user, is_verified=True).last()
        except Exception as e:
            print("Reset error:", e)
            return Response({"detail": "Invalid request"}, status=400)

        if not record:
            return Response({"detail": "OTP not verified"}, status=400)

        # ✅ UPDATE PASSWORD
        user.set_password(password)
        user.save()

        # ✅ SEND BEAUTIFUL EMAIL
        try:
            html_content = render_to_string(
                "emails/password_reset_success.html",
                {
                    "username": user.username,
                },
            )

            msg = EmailMultiAlternatives(
                subject="Password Changed Successfully 🔐",
                body="Your password has been updated.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email],
            )

            msg.attach_alternative(html_content, "text/html")
            msg.send()

        except Exception as e:
            print("Reset email error:", e)

        # ✅ DELETE OTP
        record.delete()

        return Response({"message": "Password reset successful"})


from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from .models import Subscriber


@api_view(["POST"])
def subscribe(request):
    email = request.data.get("email")

    if not email:
        return Response({"error": "Email required"}, status=400)

    # ✅ render your HTML template
    html_content = render_to_string("emails/subscription_success.html")

    subject = "Learnify Subscription 🎉"
    from_email = "your_email@gmail.com"
    to = [email]

    # ✅ create email
    msg = EmailMultiAlternatives(subject, "", from_email, to)

    # ✅ attach HTML
    msg.attach_alternative(html_content, "text/html")

    # ✅ send
    msg.send()

    return Response({"message": "Subscribed successfully"})
