from rest_framework import serializers
from .models import Post, PostComment, PostImage


# ================= COMMENTS =================
class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = PostComment
        fields = ["id", "user", "user_name", "text", "created_at"]
        read_only_fields = ["id", "user", "user_name", "created_at"]


# ================= POST IMAGES =================
class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ["id", "image"]


# ================= POSTS =================
class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.username", read_only=True)

    # existing images (read-only, for frontend display)
    images = PostImageSerializer(many=True, read_only=True)

    # ✅ NEW: image IDs to remove during edit
    removed_images = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    liked_by_me = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "author_name",
            "content",
            "images",
            "removed_images",
            "created_at",
            "updated_at",
            "likes_count",
            "comments_count",
            "liked_by_me",
            "is_owner",
        ]
        read_only_fields = [
            "id",
            "author",
            "author_name",
            "created_at",
            "updated_at",
        ]

    # -------- UPDATE (EDIT POST) --------
    def update(self, instance, validated_data):
        # get removed image IDs from request
        removed_images = validated_data.pop("removed_images", [])

        # delete images from DB
        if removed_images:
            instance.images.filter(id__in=removed_images).delete()

        return super().update(instance, validated_data)

    # -------- likes count --------
    def get_likes_count(self, obj):
        return obj.likes.count()

    # -------- comments count --------
    def get_comments_count(self, obj):
        return obj.comments.count()

    # -------- liked by me --------
    def get_liked_by_me(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.likes.filter(user=request.user).exists()

    # -------- is owner --------
    def get_is_owner(self, obj):
        request = self.context.get("request")
        return bool(
            request
            and request.user.is_authenticated
            and obj.author == request.user
        )
