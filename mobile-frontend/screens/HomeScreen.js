import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { API_URL } from '../config';

const HomeScreen = ({ navigation }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_URL}/videos/`);
      const data = await response.json();
      setVideos(data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching videos:', error);
      Alert.alert('Hata', 'Videolar yüklenirken bir hata oluştu');
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    // Her 30 saniyede bir videoları güncelle
    const interval = setInterval(fetchVideos, 30000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVideos();
  };

  const getStatusBadge = (status) => {
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

  const renderVideoItem = ({ item }) => {
    const statusBadge = getStatusBadge(item.status);
    const uploadDate = new Date(item.upload_date).toLocaleDateString('tr-TR');

    return (
      <TouchableOpacity
        style={styles.videoCard}
        onPress={() => navigation.navigate('VideoDetail', { videoId: item.id, title: item.title })}>
        <View style={styles.videoCardContent}>
          <Text style={styles.videoTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
            <Text style={styles.statusText}>{statusBadge.text}</Text>
          </View>
          <Text style={styles.dateText}>Yüklenme: {uploadDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6da7" />
        <Text style={styles.loadingText}>Videolar Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4a6da7']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz hiç video yüklenmemiş</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  videoCardContent: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#6c757d',
    fontSize: 14,
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
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
  },
});

export default HomeScreen; 