from django.urls import include, path
from .views import (
    SendOTPView,
    VerifyOTPView,
    ResetPasswordWithOTPView,
    subscribe,
)

urlpatterns = [
    path("auth/send-otp/", SendOTPView.as_view()),
    path("auth/verify-otp/", VerifyOTPView.as_view()),
    path("auth/reset-password/", ResetPasswordWithOTPView.as_view()),
    path("subscribe/", subscribe),
]
