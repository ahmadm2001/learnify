from django.urls import path
from .views import admin_dashboard, contact_us

urlpatterns = [
    path("admin/dashboard/", admin_dashboard),
    path("contact/", contact_us, name="contact_us"),
]
