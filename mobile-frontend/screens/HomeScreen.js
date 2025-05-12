import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { API_URL, COLORS } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState(null);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        fetchVideos(storedToken);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setLoading(false);
    }
  };

  const fetchVideos = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/videos/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Videolar yüklenemedi');
      }
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchVideos(token);
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${username}&password=${password}`,
      });

      if (!response.ok) {
        throw new Error('Giriş başarısız');
      }

      const data = await response.json();
      await AsyncStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      setLoginModalVisible(false);
      fetchVideos(data.access_token);
    } catch (error) {
      Alert.alert('Hata', error.message);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Kayıt başarısız');
      }

      Alert.alert('Başarılı', 'Kayıt başarılı. Şimdi giriş yapabilirsiniz.');
      setRegisterModalVisible(false);
      setLoginModalVisible(true);
    } catch (error) {
      Alert.alert('Hata', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setToken(null);
      setVideos([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'uploaded':
        return { text: 'Yüklendi', color: COLORS.secondary };
      case 'analyzing':
        return { text: 'Analiz Ediliyor', color: COLORS.warning };
      case 'completed':
        return { text: 'Analiz Tamamlandı', color: COLORS.success };
      default:
        return { text: 'Bilinmiyor', color: COLORS.secondary };
    }
  };

  const renderVideoItem = ({ item }) => {
    const statusBadge = getStatusBadge(item.status);
    const uploadDate = new Date(item.upload_date).toLocaleDateString('tr-TR');
    const analysisResults = item.analysis_results ? JSON.parse(item.analysis_results) : null;

    return (
      <TouchableOpacity
        style={styles.videoCard}
        onPress={() => navigation.navigate('VideoDetail', { videoId: item.id, title: item.title })}>
        {item.thumbnail_path && (
          <Image
            source={{ uri: `${API_URL}/${item.thumbnail_path}` }}
            style={styles.thumbnail}
          />
        )}
        <View style={styles.videoCardContent}>
          <Text style={styles.videoTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
            <Text style={styles.statusText}>{statusBadge.text}</Text>
          </View>
          <Text style={styles.dateText}>Yüklenme: {uploadDate}</Text>
          {analysisResults && (
            <Text style={styles.analysisText}>
              Süre: {Math.floor(analysisResults.duration / 60)}:{(analysisResults.duration % 60).toFixed(0).padStart(2, '0')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Videolar Yükleniyor...</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.welcomeText}>Video Analiz Sistemine Hoş Geldiniz</Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => setLoginModalVisible(true)}>
          <Text style={styles.authButtonText}>Giriş Yap</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.authButton, styles.registerButton]}
          onPress={() => setRegisterModalVisible(true)}>
          <Text style={styles.authButtonText}>Kayıt Ol</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={loginModalVisible}
          onRequestClose={() => setLoginModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Giriş Yap</Text>
              <TextInput
                style={styles.input}
                placeholder="Kullanıcı Adı"
                value={username}
                onChangeText={setUsername}
              />
              <TextInput
                style={styles.input}
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity style={styles.modalButton} onPress={handleLogin}>
                <Text style={styles.modalButtonText}>Giriş Yap</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setLoginModalVisible(false)}>
                <Text style={styles.modalCloseButtonText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={registerModalVisible}
          onRequestClose={() => setRegisterModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Kayıt Ol</Text>
              <TextInput
                style={styles.input}
                placeholder="Kullanıcı Adı"
                value={username}
                onChangeText={setUsername}
              />
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity style={styles.modalButton} onPress={handleRegister}>
                <Text style={styles.modalButtonText}>Kayıt Ol</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setRegisterModalVisible(false)}>
                <Text style={styles.modalCloseButtonText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Video Analiz Sistemi</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz hiç video yüklenmemiş</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => navigation.navigate('VideoUpload')}
      >
        <Text style={styles.uploadButtonText}>+ Yeni Video Yükle</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
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
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
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
  analysisText: {
    color: '#28a745',
    fontSize: 14,
    marginTop: 4,
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
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: COLORS.primary,
  },
  authButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: COLORS.success,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
  },
});

export default HomeScreen; 