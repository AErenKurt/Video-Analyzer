# Video Content Analyzer

Bu proje, yüklenen videolardaki uygunsuz içerikleri (küfür, hakaret vb.) tespit eden ve zaman damgalı transcript üreten bir web ve mobil uygulama platformudur.

## Özellikler

- Video yükleme ve işleme
- Ses ayrıştırma ve metne çevirme
- Türkçe dil desteği
- Zaman damgalı transcript üretimi
- Web ve mobil uyumlu arayüz

## Teknik Altyapı

### Backend
- Python 3.x
- Django 4.x
- PostgreSQL 14+
- OpenAI Whisper
- Celery
- ffmpeg

### Frontend
- Web: React/Next.js
- Mobil: React Native

### DevOps
- Docker
- Railway/Vercel/Heroku

## Kurulum

### Gereksinimler
- Python 3.x
- Node.js
- PostgreSQL 14+
- ffmpeg

### Backend Kurulumu
```bash
# Virtual environment oluşturma
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# Bağımlılıkları yükleme
pip install -r requirements.txt

# Veritabanı migrasyonları
python manage.py migrate

# Geliştirme sunucusunu başlatma
python manage.py runserver
```

### Frontend Kurulumu
```bash
# Web uygulaması
cd frontend/web
npm install
npm run dev

# Mobil uygulama
cd frontend/mobile
npm install
npm start
```

## Lisans
MIT 