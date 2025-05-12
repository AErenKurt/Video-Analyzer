# Video Analiz Sistemi

Bu proje, videoları yükleyip analiz edebilen, hareket tespiti yapabilen ve sonuçları görselleştirebilen bir web ve mobil uygulama sistemidir.

## Özellikler

- Video yükleme ve analiz
- Hareket tespiti ve analizi
- Video özellikleri analizi (süre, FPS, kare sayısı)
- Web ve mobil arayüz desteği
- Gerçek zamanlı analiz sonuçları
- Kullanıcı yönetimi ve yetkilendirme

## Teknolojiler

### Backend
- FastAPI
- OpenCV
- SQLAlchemy
- SQLite
- Python 3.8+

### Web Frontend
- React
- Material-UI
- Chart.js
- Axios

### Mobil Frontend
- React Native
- Expo
- React Navigation
- Axios

## Kurulum

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Web Frontend

```bash
cd web-frontend
npm install
npm start
```

### Mobil Frontend

```bash
cd mobile-frontend
npm install
npm start
```

## API Endpoints

- `POST /upload-video/`: Video yükleme
- `GET /videos/`: Tüm videoları listeleme
- `GET /videos/{video_id}`: Video detaylarını görüntüleme
- `GET /videos/{video_id}/analysis`: Video analiz sonuçlarını görüntüleme

## Katkıda Bulunma

1. Bu repository'yi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

Proje Sahibi - [@github_username](https://github.com/github_username)

Proje Linki: [https://github.com/github_username/video-analyzer](https://github.com/github_username/video-analyzer)
