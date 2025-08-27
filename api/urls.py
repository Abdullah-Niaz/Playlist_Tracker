from django.urls import path
from .views import fetch_playlist

urlpatterns = [
    path("playlist/", fetch_playlist, name="fetch_playlist"),
]
