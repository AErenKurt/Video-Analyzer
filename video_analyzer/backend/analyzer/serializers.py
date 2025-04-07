from rest_framework import serializers
from .models import Video, AnalysisResult

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