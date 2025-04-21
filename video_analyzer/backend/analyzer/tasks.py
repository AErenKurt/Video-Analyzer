import os
import ffmpeg
import whisper
from celery import shared_task
from django.conf import settings
from .models import Video, AnalysisJob, Transcript, InappropriateContent

@shared_task
def analyze_video(video_id, job_id):
    try:
        video = Video.objects.get(id=video_id)
        job = AnalysisJob.objects.get(job_id=job_id)
        
        # Video dosyasının tam yolunu al
        video_path = os.path.join(settings.MEDIA_ROOT, str(video.video_file))
        
        # Ses dosyasını çıkar
        audio_path = os.path.join(settings.MEDIA_ROOT, f'audio_{video_id}.wav')
        try:
            stream = ffmpeg.input(video_path)
            stream = ffmpeg.output(stream, audio_path)
            ffmpeg.run(stream, overwrite_output=True)
        except ffmpeg.Error as e:
            job.status = 'failed'
            job.error_message = f'FFmpeg error: {str(e)}'
            job.save()
            return
        
        # Whisper ile sesi metne dönüştür
        try:
            model = whisper.load_model("base")
            result = model.transcribe(audio_path)
            
            # Transkripti kaydet
            transcript = Transcript.objects.create(
                video=video,
                content=result['text'],
                language=result['language']
            )
            
            # Uygunsuz içerik analizi yap
            # TODO: Daha gelişmiş içerik analizi ekle
            inappropriate_content = InappropriateContent.objects.create(
                video=video,
                content_type='text',
                content=result['text'],
                confidence=0.0  # Şimdilik sabit değer
            )
            
            # İş durumunu güncelle
            job.status = 'completed'
            job.save()
            
            # Geçici ses dosyasını sil
            os.remove(audio_path)
            
        except Exception as e:
            job.status = 'failed'
            job.error_message = f'Whisper error: {str(e)}'
            job.save()
            if os.path.exists(audio_path):
                os.remove(audio_path)
            return
            
    except Exception as e:
        if job:
            job.status = 'failed'
            job.error_message = f'General error: {str(e)}'
            job.save()
        return 