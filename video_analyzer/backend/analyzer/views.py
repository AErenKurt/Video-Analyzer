from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Video, AnalysisResult
from .serializers import VideoSerializer, AnalysisResultSerializer

# HTML View functions
def index(request):
    return render(request, 'index.html')

def video_detail(request, video_id=None):
    return render(request, 'video-detail.html')

# API ViewSets
class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all().order_by('-upload_date')
    serializer_class = VideoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['title']
    ordering_fields = ['upload_date', 'title']

    @action(detail=True, methods=['post'])
    def start_analysis(self, request, pk=None):
        video = self.get_object()
        video.status = 'analyzing'
        video.save()
        
        # Burada video analizi başlatılacak
        # Şimdilik sadece bir sonuç objesi oluşturalım
        result, created = AnalysisResult.objects.get_or_create(
            video=video,
            defaults={
                'inappropriate_content': 'Analiz henüz tamamlanmadı.',
                'transcript': 'Transkript henüz oluşturulmadı.'
            }
        )
        
        # Gerçek uygulamada burada bir Celery görevi başlatılacak
        
        return Response({'status': 'analysis started'})

class AnalysisResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AnalysisResult.objects.all()
    serializer_class = AnalysisResultSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['video']
