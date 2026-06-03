# backend/users/permissions.py
from rest_framework.permissions import BasePermission


class IsTeacherOrAdmin(BasePermission):
    """
    Allow access only to:
    - users whose profile.role is TEACHER_APPROVED or ADMIN
    - staff users (is_staff) are always allowed
    Used for instructor / teacher-only views.
    """

    def _has_teacher_role(self, user):
        profile = getattr(user, "profile", None)
        if not profile:
            return False
        return profile.role in ("TEACHER_APPROVED", "ADMIN")

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # staff/admin always allowed
        if getattr(user, "is_staff", False):
            return True

        return self._has_teacher_role(user)

    def has_object_permission(self, request, view, obj):
        """
        For course objects, also make sure the current user is the owner (teacher),
        unless they are staff.
        """
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if getattr(user, "is_staff", False):
            return True

        # if object has teacher field, enforce ownership
        teacher = getattr(obj, "teacher", None)
        if teacher is not None:
            return teacher == user

        # fall back to role check
        return self._has_teacher_role(user)
