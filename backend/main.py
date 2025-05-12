from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
import cv2
import numpy as np
import os
import json
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

app = FastAPI(title="Video Analiz API", version="1.0.0")

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT ayarları
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Şifreleme
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Veritabanı bağlantısı
SQLALCHEMY_DATABASE_URL = "sqlite:///./video_analyzer.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Pydantic modelleri
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Veritabanı modelleri
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class Video(Base):
    __tablename__ = "videos"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    file_path = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String)  # uploaded, analyzing, completed, error
    analysis_results = Column(String)  # JSON formatında analiz sonuçları
    user_id = Column(Integer, ForeignKey("users.id"))
    thumbnail_path = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Yardımcı fonksiyonlar
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Geçersiz kimlik bilgileri",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# Video analiz fonksiyonu
def analyze_video(video_path: str) -> dict:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise HTTPException(status_code=400, detail="Video açılamadı")
    
    # Video özellikleri
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count / fps
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    # Hareket analizi
    motion_frames = 0
    prev_frame = None
    motion_intensity = []
    
    # Thumbnail oluştur
    ret, frame = cap.read()
    if ret:
        thumbnail_path = f"thumbnails/{os.path.basename(video_path)}.jpg"
        os.makedirs("thumbnails", exist_ok=True)
        cv2.imwrite(thumbnail_path, frame)
    
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
        
        motion_intensity.append(np.sum(thresh))
        if np.sum(thresh) > 1000:  # Hareket eşiği
            motion_frames += 1
            
        prev_frame = gray
    
    cap.release()
    
    # Analiz sonuçları
    results = {
        "duration": duration,
        "fps": fps,
        "frame_count": frame_count,
        "resolution": f"{width}x{height}",
        "motion_percentage": (motion_frames / frame_count) * 100,
        "motion_intensity": {
            "min": float(np.min(motion_intensity)),
            "max": float(np.max(motion_intensity)),
            "mean": float(np.mean(motion_intensity))
        },
        "thumbnail_path": thumbnail_path if ret else None
    }
    
    return results

# API Endpoints
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz kullanıcı adı veya şifre",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=User)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Kullanıcı adı zaten kullanımda")
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/upload-video/")
async def upload_video(
    file: UploadFile = File(...),
    title: str = None,
    current_user: User = Depends(get_current_user),
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
        status="uploaded",
        user_id=current_user.id
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    
    # Video analizi
    try:
        results = analyze_video(video_path)
        video.status = "completed"
        video.analysis_results = json.dumps(results)
        video.thumbnail_path = results.get("thumbnail_path")
        db.commit()
    except Exception as e:
        video.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"id": video.id, "status": video.status, "results": results}

@app.get("/videos/", response_model=List[dict])
def get_videos(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    videos = db.query(Video).filter(Video.user_id == current_user.id).offset(skip).limit(limit).all()
    return videos

@app.get("/videos/{video_id}")
def get_video(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == current_user.id
    ).first()
    if video is None:
        raise HTTPException(status_code=404, detail="Video bulunamadı")
    return video

@app.delete("/videos/{video_id}")
def delete_video(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == current_user.id
    ).first()
    if video is None:
        raise HTTPException(status_code=404, detail="Video bulunamadı")
    
    # Dosyaları sil
    if os.path.exists(video.file_path):
        os.remove(video.file_path)
    if video.thumbnail_path and os.path.exists(video.thumbnail_path):
        os.remove(video.thumbnail_path)
    
    db.delete(video)
    db.commit()
    return {"message": "Video başarıyla silindi"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
