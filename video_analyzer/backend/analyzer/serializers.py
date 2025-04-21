from rest_framework import serializers
from .models import Video, AnalysisResult, InappropriateContent, Transcript, AnalysisJob

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'title', 'file_path', 'video_file', 'upload_date', 'status', 'duration', 'file_size']
        read_only_fields = ['upload_date', 'duration', 'file_size']

    def create(self, validated_data):
        # Eğer video_file yüklendiyse, file_path'i otomatik dolduralım
        video = Video.objects.create(**validated_data)
        if video.video_file and not video.file_path:
            video.file_path = video.video_file.url
            video.save()
        return video

class AnalysisResultSerializer(serializers.ModelSerializer):
    video_title = serializers.CharField(source='video.title', read_only=True)
    
    class Meta:
        model = AnalysisResult
        fields = ['id', 'video', 'video_title', 'inappropriate_content', 'transcript', 'analysis_date']
        read_only_fields = ['analysis_date']

class InappropriateContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = InappropriateContent
        fields = ['id', 'video', 'content_type', 'content', 'confidence', 'timestamp']
        read_only_fields = ['timestamp']

class TranscriptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transcript
        fields = ['id', 'video', 'content', 'language', 'created_at']
        read_only_fields = ['created_at']

class AnalysisJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisJob
        fields = ['id', 'video', 'job_id', 'status', 'progress', 'error_message', 'created_at', 'completed_at']
        read_only_fields = ['job_id', 'created_at', 'completed_at'] 