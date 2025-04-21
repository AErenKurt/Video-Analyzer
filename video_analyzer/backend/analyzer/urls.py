from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'videos', views.VideoViewSet)
router.register(r'inappropriate-content', views.InappropriateContentViewSet)
router.register(r'transcripts', views.TranscriptViewSet)
router.register(r'analysis-jobs', views.AnalysisJobViewSet)

urlpatterns = [
    path('', views.index, name='index'),
    path('video/<int:video_id>/', views.video_detail, name='video_detail'),
    path('api/', include(router.urls)),
] 