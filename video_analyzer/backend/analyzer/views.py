from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Video, AnalysisResult, InappropriateContent, Transcript, AnalysisJob
from .serializers import VideoSerializer, AnalysisResultSerializer, InappropriateContentSerializer, TranscriptSerializer, AnalysisJobSerializer
import uuid
import os
from django.conf import settings

# HTML View functions
def index(request):
    videos = Video.objects.all()
    return render(request, 'index.html', {'videos': videos})

def video_detail(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    return render(request, 'video-detail.html', {'video': video})

# API ViewSets
class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']

    @action(detail=True, methods=['post'])
    def start_analysis(self, request, pk=None):
        video = self.get_object()
        
        # Video dosyasının varlığını kontrol et
        if not video.video_file:
            return Response(
                {"error": "Video dosyası bulunamadı"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Yeni bir analiz işi oluştur
        analysis_job = AnalysisJob.objects.create(
            video=video,
            status='pending',
            job_id=str(uuid.uuid4())
        )
        
        # TODO: Burada gerçek analiz işlemi başlatılacak
        # Şimdilik sadece iş durumunu güncelle
        analysis_job.status = 'processing'
        analysis_job.save()
        
        return Response(
            {
                "message": "Video analizi başlatıldı",
                "job_id": analysis_job.job_id
            },
            status=status.HTTP_202_ACCEPTED
        )

    @action(detail=True, methods=['get'])
    def analysis_status(self, request, pk=None):
        video = self.get_object()
        analysis_job = get_object_or_404(AnalysisJob, video=video)
        
        return Response({
            "status": analysis_job.status,
            "progress": analysis_job.progress,
            "created_at": analysis_job.created_at,
            "completed_at": analysis_job.completed_at
        })

class AnalysisResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AnalysisResult.objects.all()
    serializer_class = AnalysisResultSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['video']

class InappropriateContentViewSet(viewsets.ModelViewSet):
    queryset = InappropriateContent.objects.all()
    serializer_class = InappropriateContentSerializer

class TranscriptViewSet(viewsets.ModelViewSet):
    queryset = Transcript.objects.all()
    serializer_class = TranscriptSerializer

class AnalysisJobViewSet(viewsets.ModelViewSet):
    queryset = AnalysisJob.objects.all()
    serializer_class = AnalysisJobSerializer
