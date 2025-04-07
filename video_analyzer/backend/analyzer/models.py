from django.db import models
import os
from uuid import uuid4

def video_upload_path(instance, filename):
    # Dosya adını benzersiz yapmak için UUID kullanılıyor
    ext = filename.split('.')[-1]
    filename = f"{uuid4().hex}.{ext}"
    return os.path.join('videos', filename)

class Video(models.Model):
    title = models.CharField(max_length=255)
    file_path = models.CharField(max_length=255, blank=True)
    video_file = models.FileField(upload_to=video_upload_path, null=True, blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='uploaded')  # uploaded, analyzing, completed
    
    # Video metadata
    duration = models.FloatField(null=True, blank=True)  # seconds
    file_size = models.IntegerField(null=True, blank=True)  # bytes
    
    def __str__(self):
        return self.title

class AnalysisResult(models.Model):
    video = models.OneToOneField(Video, on_delete=models.CASCADE)
    inappropriate_content = models.TextField(blank=True)
    transcript = models.TextField(blank=True)
    analysis_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis Result for {self.video.title}"
