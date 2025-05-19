import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { API_URL, COLORS } from '../config';

const VideoDetailScreen = ({ route, navigation }) => {
  const { videoId } = route.params;
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVideoDetails();
  };

  const handleDelete = async () => {
    Alert.alert(
      'Video Sil',
      'Bu videoyu silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(`${API_URL}/videos/${videoId}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Video silinemedi');
              }

              Alert.alert('Başarılı', 'Video başarıyla silindi', [
                {
                  text: 'Tamam',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              Alert.alert('Hata', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Video detayları yükleniyor...</Text>
      </View>
    );
  }

  if (!video) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Video bulunamadı</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchVideoDetails}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const analysisResults = video.analysis_results
    ? JSON.parse(video.analysis_results)
    : null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.header}>
        <Text style={styles.title}>{video.title}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(video.status) },
          ]}>
          <Text style={styles.statusText}>{getStatusText(video.status)}</Text>
        </View>
      </View>

      {video.thumbnail_path && (
        <Image
          source={{ uri: `${API_URL}/${video.thumbnail_path}` }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      )}

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

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Videoyu Sil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'uploaded':
      return COLORS.secondary;
    case 'analyzing':
      return COLORS.warning;
    case 'completed':
      return COLORS.success;
    default:
      return COLORS.secondary;
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
    color: COLORS.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#ddd',
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
  deleteButton: {
    backgroundColor: COLORS.error,
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VideoDetailScreen; 