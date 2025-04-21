import os
from celery import Celery

# Django ayarlarını yükle
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'video_analyzer.backend.config.settings')

# Celery uygulamasını oluştur
app = Celery('video_analyzer')

# Celery ayarlarını Django ayarlarından yükle
app.config_from_object('django.conf:settings', namespace='CELERY')

# Görev modüllerini otomatik olarak yükle
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}') 