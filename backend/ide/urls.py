from django.urls import path
from .views import RunCodeView, SnippetListCreateView

urlpatterns = [
    path("run/", RunCodeView.as_view(), name="ide-run"),
    path("snippets/", SnippetListCreateView.as_view(), name="ide-snippets"),
]
