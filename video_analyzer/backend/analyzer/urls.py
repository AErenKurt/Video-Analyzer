from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'videos', views.VideoViewSet)
router.register(r'analysis-results', views.AnalysisResultViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 