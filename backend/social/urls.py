from django.urls import path
from .views import (
    PostListCreateView,
    PostDetailView,
    ToggleLikeView,
    PostCommentListCreateView,
    DeleteCommentView,
    HomeFeedView,
)

urlpatterns = [
    path("posts/", PostListCreateView.as_view(), name="posts"),
    path("posts/<int:pk>/", PostDetailView.as_view(), name="post-detail"),
    path("posts/<int:pk>/like/", ToggleLikeView.as_view(), name="post-like"),
    path("posts/<int:pk>/comments/", PostCommentListCreateView.as_view(), name="post-comments"),
    path("comments/<int:pk>/", DeleteCommentView.as_view()),
    path("posts/home/", HomeFeedView.as_view()),

]
