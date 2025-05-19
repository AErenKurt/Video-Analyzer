import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { API_URL, COLORS } from '../config';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const VideoUploadScreen = ({ navigation }) => {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        if (result.size > MAX_FILE_SIZE) {
          Alert.alert(
            'Hata',
            `Video boyutu çok büyük. Maksimum dosya boyutu: ${formatFileSize(MAX_FILE_SIZE)}`
          );
          return;
        }
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

    if (title.trim().length === 0) {
      Alert.alert('Uyarı', 'Lütfen video başlığı girin');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedVideo.uri,
        name: selectedVideo.name,
        type: selectedVideo.mimeType,
      });
      
      formData.append('title', title.trim());

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/upload-video/`);
      xhr.setRequestHeader('Content-Type', 'multipart/form-data');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(progress));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          Alert.alert('Başarılı', 'Video başarıyla yüklendi', [
            {
              text: 'Tamam',
              onPress: () => navigation.navigate('Home'),
            },
          ]);
        } else {
          const response = JSON.parse(xhr.responseText);
          throw new Error(response.detail || 'Video yüklenirken bir hata oluştu');
        }
      };

      xhr.onerror = () => {
        throw new Error('Ağ hatası oluştu');
      };

      xhr.send(formData);
    } catch (error) {
      Alert.alert('Hata', error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Video Yükle</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Video başlığı"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          <TouchableOpacity
            style={[styles.pickButton, uploading && styles.disabledButton]}
            onPress={pickVideo}
            disabled={uploading}>
            <Text style={styles.buttonText}>
              {selectedVideo ? 'Video Seçildi' : 'Video Seç'}
            </Text>
          </TouchableOpacity>

          {selectedVideo && (
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{selectedVideo.name}</Text>
              <Text style={styles.fileSize}>
                Boyut: {formatFileSize(selectedVideo.size)}
              </Text>
            </View>
          )}

          {uploading && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Yükleniyor: %{uploadProgress}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${uploadProgress}%` },
                  ]}
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.uploadButton,
              (uploading || !selectedVideo) && styles.disabledButton,
            ]}
            onPress={uploadVideo}
            disabled={uploading || !selectedVideo}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Yükle</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: COLORS.primary,
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
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  fileName: {
    color: '#333',
    fontSize: 16,
    marginBottom: 5,
  },
  fileSize: {
    color: '#666',
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 5,
    color: '#666',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
});

export default VideoUploadScreen; 