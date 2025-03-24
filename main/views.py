from django.shortcuts import render, redirect

# Create your views here.

def index(request):
    # Şimdilik boş bir video listesi gönderelim
    videos = []
    return render(request, 'index.html', {'videos': videos})

def upload_video(request):
    if request.method == 'POST':
        # Video yükleme işlemleri burada yapılacak
        pass
    return redirect('index')
