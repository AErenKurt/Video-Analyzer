from django.contrib import admin
from .models import Video, AnalysisResult

# Register your models here.
admin.site.register(Video)
admin.site.register(AnalysisResult)
