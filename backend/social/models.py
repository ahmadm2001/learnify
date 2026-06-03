from django.db import models
from django.contrib.auth.models import User


# ===================== POST =====================
class Post(models.Model):
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="posts"
    )
    content = models.TextField(blank=True)  # allow image-only posts
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]  # newest first (LinkedIn style)

    def __str__(self):
        return f"{self.author.username} - {self.content[:30]}"


# ===================== POST IMAGES =====================
class PostImage(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="images"  # ✅ THIS ENABLES MULTIPLE IMAGES
    )
    image = models.ImageField(upload_to="posts/images/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for Post {self.post.id}"


# ===================== POST LIKES =====================
class PostLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="likes"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")

    def __str__(self):
        return f"{self.user.username} liked Post {self.post.id}"


# ===================== POST COMMENTS =====================
class PostComment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="comments"
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.user.username} commented on Post {self.post.id}"
