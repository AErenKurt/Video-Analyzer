import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { API_URL } from '../config';

const VideoDetailScreen = ({ route, navigation }) => {
  const { videoId } = route.params;
  
  const [video, setVideo] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVideoDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/videos/${videoId}/`);
      const data = await response.json();
      setVideo(data);
      
      if (data.status === 'completed') {
        fetchAnalysisResults();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
      Alert.alert('Hata', 'Video detayları yüklenirken bir hata oluştu');
      setLoading(false);
    }
  };

  const fetchAnalysisResults = async () => {
    try {
      const response = await fetch(`${API_URL}/analysis-results/`);
      const allResults = await response.json();
      const result = allResults.find(r => r.video == videoId);
      
      if (result) {
        setAnalysisResult(result);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analysis results:', error);
      setLoading(false);
    }
  };

  const startAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/videos/${videoId}/start_analysis/`, {
        method: 'POST',
      });
      
      if (response.ok) {
        Alert.alert('Başarılı', 'Analiz başlatıldı!');
        fetchVideoDetails();
      } else {
        Alert.alert('Hata', 'Analiz başlatılırken bir hata oluştu');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error starting analysis:', error);
      Alert.alert('Hata', 'Analiz başlatılırken bir hata oluştu');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoDetails();
  }, [videoId]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'uploaded':
        return { text: 'Yüklendi', color: '#6c757d' };
      case 'analyzing':
        return { text: 'Analiz Ediliyor', color: '#ffc107' };
      case 'completed':
        return { text: 'Analiz Tamamlandı', color: '#28a745' };
      default:
        return { text: 'Bilinmiyor', color: '#6c757d' };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6da7" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
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

  const statusInfo = getStatusInfo(video.status);
  const uploadDate = new Date(video.upload_date).toLocaleDateString('tr-TR');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.videoInfo}>
        <View style={styles.titleContainer}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusText}>{statusInfo.text}</Text>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Yüklenme Tarihi: </Text>
            {uploadDate}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Dosya Yolu: </Text>
            {video.file_path}
          </Text>
        </View>
        
        {video.status === 'uploaded' && (
          <TouchableOpacity 
            style={styles.analyzeButton} 
            onPress={startAnalysis}>
            <Text style={styles.analyzeButtonText}>Analizi Başlat</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {(video.status === 'completed' && analysisResult) && (
        <View style={styles.analysisContainer}>
          <Text style={styles.sectionTitle}>Analiz Sonuçları</Text>
          
          <View style={styles.sectionContent}>
            <Text style={styles.subsectionTitle}>Uygunsuz İçerik Tespiti</Text>
            {analysisResult.inappropriate_content ? (
              <View style={styles.inappropriateContainer}>
                {analysisResult.inappropriate_content.split('\n').map((line, index) => (
                  line.trim() ? (
                    <View key={index} style={styles.inappropriateItem}>
                      <Text style={styles.inappropriateText}>{line}</Text>
                    </View>
                  ) : null
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Uygunsuz içerik tespit edilmedi</Text>
            )}
          </View>
          
          <View style={styles.sectionContent}>
            <Text style={styles.subsectionTitle}>Video Transkripti</Text>
            <ScrollView style={styles.transcriptContainer}>
              {analysisResult.transcript ? (
                <Text style={styles.transcriptText}>{analysisResult.transcript}</Text>
              ) : (
                <Text style={styles.emptyText}>Transkript oluşturulmadı</Text>
              )}
            </ScrollView>
          </View>
        </View>
      )}
      
      {video.status === 'analyzing' && (
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color="#ffc107" />
          <Text style={styles.analyzingText}>Video analiz ediliyor...</Text>
          <Text style={styles.analyzingSubtext}>Bu işlem birkaç dakika sürebilir</Text>
        </View>
      )}
    </ScrollView>
  );
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
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
  },
  videoInfo: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  detailLabel: {
    fontWeight: 'bold',
  },
  analyzeButton: {
    backgroundColor: '#ffc107',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#212529',
    fontWeight: 'bold',
    fontSize: 16,
  },
  analysisContainer: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inappropriateContainer: {
    marginTop: 8,
  },
  inappropriateItem: {
    backgroundColor: '#f8d7da',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  inappropriateText: {
    color: '#721c24',
  },
  transcriptContainer: {
    maxHeight: 300,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  transcriptText: {
    color: '#212529',
    lineHeight: 20,
  },
  emptyText: {
    color: '#6c757d',
    fontStyle: 'italic',
  },
  analyzingContainer: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#212529',
  },
  analyzingSubtext: {
    color: '#6c757d',
    fontSize: 14,
  },
});

export default VideoDetailScreen; 