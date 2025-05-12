import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { API_URL } from '../config';

const VideoUploadScreen = ({ navigation }) => {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setSelectedVideo(result);
      }
    } catch (error) {
      Alert.alert('Hata', 'Video seçilirken bir hata oluştu');
    }
  };

  const uploadVideo = async () => {
    if (!selectedVideo) {
      Alert.alert('Uyarı', 'Lütfen bir video seçin');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedVideo.uri,
        name: selectedVideo.name,
        type: selectedVideo.mimeType,
      });
      
      if (title) {
        formData.append('title', title);
      }

      const response = await fetch(`${API_URL}/upload-video/`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Başarılı', 'Video başarıyla yüklendi', [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('Home'),
          },
        ]);
      } else {
        throw new Error(data.detail || 'Video yüklenirken bir hata oluştu');
      }
    } catch (error) {
      Alert.alert('Hata', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Video başlığı (opsiyonel)"
        value={title}
        onChangeText={setTitle}
      />

      <TouchableOpacity
        style={styles.pickButton}
        onPress={pickVideo}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>
          {selectedVideo ? 'Video Seçildi' : 'Video Seç'}
        </Text>
      </TouchableOpacity>

      {selectedVideo && (
        <Text style={styles.fileName}>{selectedVideo.name}</Text>
      )}

      <TouchableOpacity
        style={[styles.uploadButton, uploading && styles.disabledButton]}
        onPress={uploadVideo}
        disabled={uploading || !selectedVideo}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Yükle</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickButton: {
    backgroundColor: '#4a6da7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileName: {
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
  },
});

export default VideoUploadScreen; 