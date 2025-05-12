from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import cv2
import numpy as np
import os
from typing import List
import json

app = FastAPI()

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Veritabanı bağlantısı
SQLALCHEMY_DATABASE_URL = "sqlite:///./video_analyzer.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Veritabanı modelleri
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Video(Base):
    __tablename__ = "videos"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    file_path = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String)  # uploaded, analyzing, completed
    analysis_results = Column(String)  # JSON formatında analiz sonuçları
    user_id = Column(Integer, ForeignKey("users.id"))

Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Video analiz fonksiyonu
def analyze_video(video_path: str) -> dict:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise HTTPException(status_code=400, detail="Video açılamadı")
    
    # Video özellikleri
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count / fps
    
    # Hareket analizi
    motion_frames = 0
    prev_frame = None
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)
        
        if prev_frame is None:
            prev_frame = gray
            continue
            
        frame_diff = cv2.absdiff(prev_frame, gray)
        thresh = cv2.threshold(frame_diff, 25, 255, cv2.THRESH_BINARY)[1]
        
        if np.sum(thresh) > 1000:  # Hareket eşiği
            motion_frames += 1
            
        prev_frame = gray
    
    cap.release()
    
    # Analiz sonuçları
    results = {
        "duration": duration,
        "fps": fps,
        "frame_count": frame_count,
        "motion_percentage": (motion_frames / frame_count) * 100
    }
    
    return results

@app.post("/upload-video/")
async def upload_video(
    file: UploadFile = File(...),
    title: str = None,
    db: Session = Depends(get_db)
):
    # Video kaydetme
    video_path = f"uploads/{file.filename}"
    os.makedirs("uploads", exist_ok=True)
    
    with open(video_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Veritabanına kaydet
    video = Video(
        title=title or file.filename,
        file_path=video_path,
        status="uploaded"
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    
    # Video analizi
    try:
        results = analyze_video(video_path)
        video.status = "completed"
        video.analysis_results = json.dumps(results)
        db.commit()
    except Exception as e:
        video.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"id": video.id, "status": video.status, "results": results}

@app.get("/videos/")
def get_videos(db: Session = Depends(get_db)):
    videos = db.query(Video).all()
    return videos

@app.get("/videos/{video_id}")
def get_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if video is None:
        raise HTTPException(status_code=404, detail="Video bulunamadı")
    return video

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
