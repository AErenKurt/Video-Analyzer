// API bağlantı ayarları
export const API_URL = __DEV__ 
  ? 'http://localhost:8000'
  : 'https://api.videoanalyzer.com';

export const WS_URL = __DEV__
  ? 'ws://localhost:8000/ws'
  : 'wss://api.videoanalyzer.com/ws';

// Uygulama sürümü
export const APP_VERSION = '1.0.0';

// Özel renkler
export const COLORS = {
  primary: '#4a6da7',
  secondary: '#6c757d',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  error: '#dc3545',
  background: '#f5f5f5',
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#ffffff',
  },
  border: '#dddddd',
};

// Uygulama ayarları
export const APP_CONFIG = {
  maxVideoSize: 100 * 1024 * 1024, // 100MB
  supportedVideoFormats: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  thumbnailQuality: 0.7,
  refreshInterval: 5000, // 5 saniye
  maxRetryAttempts: 3,
  timeoutDuration: 30000, // 30 saniye
};

// Hata mesajları
export const ERROR_MESSAGES = {
  network: 'İnternet bağlantınızı kontrol edin',
  server: 'Sunucu hatası oluştu',
  auth: 'Oturum süreniz doldu, lütfen tekrar giriş yapın',
  upload: 'Video yüklenirken bir hata oluştu',
  delete: 'Video silinirken bir hata oluştu',
  invalidFile: 'Desteklenmeyen dosya formatı',
  fileTooLarge: 'Dosya boyutu çok büyük',
  required: 'Bu alan zorunludur',
  invalidEmail: 'Geçersiz e-posta adresi',
  passwordLength: 'Şifre en az 6 karakter olmalıdır',
}; 