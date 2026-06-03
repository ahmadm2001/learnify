from django.contrib.auth.models import User
from rest_framework import serializers
from .models import TeacherApplication
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import TeacherApplication
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    # NEW FIELDS
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    id_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    address = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "name",
            "phone",
            "id_number",
            "address",
        ]

    def create(self, validated_data):
        name = validated_data.pop("name", "")
        phone = validated_data.pop("phone", "")
        id_number = validated_data.pop("id_number", "")
        address = validated_data.pop("address", "")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )

        # Set first/last name from 'name'
        if name:
            parts = name.split(" ", 1)
            user.first_name = parts[0]
            if len(parts) > 1:
                user.last_name = parts[1]
            user.save()

        # Update profile extra fields
        profile = user.profile  # created by signals
        if phone:
            profile.phone = phone
        if id_number:
            profile.id_number = id_number
        if address:
            profile.address = address
        profile.save()

        return user


class MeSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    is_staff = serializers.BooleanField(read_only=True)
    bio = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    id_number = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_staff",
            "bio",
            "avatar_url",
            "phone",
            "id_number",
            "address",
        ]

    def get_role(self, obj):
        if hasattr(obj, "profile"):
            return obj.profile.role
        return "STUDENT"

    def get_bio(self, obj):
        if hasattr(obj, "profile"):
            return obj.profile.bio
        return ""

    def get_avatar_url(self, obj):
        if hasattr(obj, "profile"):
            return obj.profile.avatar_url
        return ""

    def get_phone(self, obj):
        if hasattr(obj, "profile"):
            return obj.profile.phone
        return ""

    def get_id_number(self, obj):
        if hasattr(obj, "profile"):
            return obj.profile.id_number
        return ""

    def get_address(self, obj):
        if hasattr(obj, "profile"):
            return obj.profile.address
        return ""


class TeacherApplicationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = TeacherApplication
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone",
            "status",
            "resume_url",
            "created_at",
        ]

    def get_resume_url(self, obj):
        request = self.context.get("request")
        if obj.resume_file:
            if request:
                return request.build_absolute_uri(obj.resume_file.url)
            return obj.resume_file.url
        return None


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Login using EMAIL + PASSWORD instead of username.
    """

    # DRF must know this field exists in the input
    email = serializers.EmailField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove the original "username" field so it's not required
        self.fields.pop(self.username_field, None)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email:
            raise AuthenticationFailed("Email is required.")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("No user with this email.")

        if not user.check_password(password):
            raise AuthenticationFailed("Invalid password.")

        # Call parent with username found from email
        data = super().validate(
            {
                "username": user.username,
                "password": password,
            }
        )

        return data
