from django.db import models
from django.contrib.auth.models import User

class Snippet(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="snippets")
    language = models.CharField(max_length=20)  # python, javascript
    code = models.TextField()
    last_run_status = models.CharField(max_length=50, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.owner.username} - {self.language}"
