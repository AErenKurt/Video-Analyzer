import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { API_URL } from '../config';

const VideoDetailScreen = ({ route }) => {
  const { videoId } = route.params;
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideoDetails();
  }, [videoId]);

  const fetchVideoDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/videos/${videoId}`);
      if (!response.ok) {
        throw new Error('Video detayları alınamadı');
      }
      const data = await response.json();
      setVideo(data);
    } catch (error) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6da7" />
        <Text style={styles.loadingText}>Video detayları yükleniyor...</Text>
      </View>
    );
  }

  if (!video) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Video bulunamadı</Text>
      </View>
    );
  }

  const analysisResults = video.analysis_results
    ? JSON.parse(video.analysis_results)
    : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{video.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(video.status) }]}>
          <Text style={styles.statusText}>{getStatusText(video.status)}</Text>
        </View>
      </View>

      <Text style={styles.dateText}>
        Yüklenme Tarihi: {new Date(video.upload_date).toLocaleDateString('tr-TR')}
      </Text>

      {analysisResults && (
        <View style={styles.analysisContainer}>
          <Text style={styles.sectionTitle}>Analiz Sonuçları</Text>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Süre:</Text>
            <Text style={styles.resultValue}>
              {formatDuration(analysisResults.duration)}
            </Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>FPS:</Text>
            <Text style={styles.resultValue}>
              {analysisResults.fps.toFixed(2)}
            </Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Kare Sayısı:</Text>
            <Text style={styles.resultValue}>
              {analysisResults.frame_count.toLocaleString()}
            </Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Hareket Oranı:</Text>
            <Text style={styles.resultValue}>
              {analysisResults.motion_percentage.toFixed(1)}%
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'uploaded':
      return '#6c757d';
    case 'analyzing':
      return '#ffc107';
    case 'completed':
      return '#28a745';
    default:
      return '#6c757d';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'uploaded':
      return 'Yüklendi';
    case 'analyzing':
      return 'Analiz Ediliyor';
    case 'completed':
      return 'Analiz Tamamlandı';
    default:
      return 'Bilinmiyor';
  }
};

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4a6da7',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    padding: 20,
    color: '#666',
    fontSize: 14,
  },
  analysisContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default VideoDetailScreen; 