from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Post, PostLike, PostComment, PostImage
from .serializers import PostSerializer, CommentSerializer
from .permissions import IsPostOwner


# ======================================================
# 1) FEED + CREATE POST (TEXT + MULTIPLE IMAGES)
# ======================================================
class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user

        # SAFETY: user must have profile
        if not hasattr(user, "profile"):
            return Post.objects.none()

        role = user.profile.role  # ✅ FIXED

        return (
            Post.objects
            .filter(author__profile__role=role)
            .order_by("-created_at")
        )

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)

        images = self.request.FILES.getlist("images")
        for image in images:
            PostImage.objects.create(post=post, image=image)



# ======================================================
# 2) EDIT / DELETE POST (AUTHOR ONLY)
# ======================================================
class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated, IsPostOwner]

    def get_serializer_context(self):
        return {"request": self.request}


# ======================================================
# 3) LIKE / UNLIKE TOGGLE
# ======================================================
class ToggleLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)

        like = PostLike.objects.filter(
            user=request.user,
            post=post
        ).first()

        if like:
            like.delete()
            return Response({"detail": "Unliked"}, status=200)

        PostLike.objects.create(
            user=request.user,
            post=post
        )
        return Response({"detail": "Liked"}, status=201)


# ======================================================
# 4) LIST + CREATE COMMENTS
# ======================================================
class PostCommentListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        comments = PostComment.objects.filter(
            post=post
        ).order_by("created_at")

        serializer = CommentSerializer(
            comments,
            many=True,
            context={"request": request}
        )
        return Response(serializer.data, status=200)

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        text = (request.data.get("text") or "").strip()

        if not text:
            return Response(
                {"detail": "Comment text required"},
                status=400
            )

        comment = PostComment.objects.create(
            user=request.user,
            post=post,
            text=text
        )

        serializer = CommentSerializer(
            comment,
            context={"request": request}
        )
        return Response(serializer.data, status=201)
    


# ======================================================
# 5) DELETE COMMENT (AUTHOR ONLY)
# ======================================================
class DeleteCommentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        comment = get_object_or_404(PostComment, pk=pk)

        # Only comment owner can delete
        if comment.user != request.user:
            return Response(
                {"detail": "You are not allowed to delete this comment"},
                status=403
            )

        comment.delete()
        return Response(status=204)



# ======================================================
# 0) HOME FEED (ALL POSTS, READ-ONLY)
# ======================================================
class HomeFeedView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Post.objects.all().order_by("-created_at")

    def get_serializer_context(self):
        return {"request": self.request}
