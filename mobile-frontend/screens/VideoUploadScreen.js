import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'react-native-document-picker';
import { useNavigation } from '@react-navigation/native';

const VideoUploadScreen = () => {
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation();

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.video],
      });

      // Video seçildi, yükleme işlemini başlat
      setUploading(true);
      
      // TODO: Backend'e video yükleme işlemi burada yapılacak
      // Şimdilik simüle ediyoruz
      setTimeout(() => {
        setUploading(false);
        Alert.alert(
          'Başarılı',
          'Video başarıyla yüklendi ve analiz ediliyor.',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.navigate('VideoDetail', { videoId: '123' }),
            },
          ]
        );
      }, 2000);

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // Kullanıcı iptal etti
        return;
      }
      Alert.alert('Hata', 'Video seçilirken bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Yükle</Text>
      <Text style={styles.subtitle}>
        Analiz etmek istediğiniz videoyu seçin
      </Text>

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={pickVideo}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Text style={styles.uploadButtonText}>Video Seç</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.infoText}>
        Desteklenen formatlar: MP4, MOV, AVI{'\n'}
        Maksimum dosya boyutu: 100MB
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoText: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default VideoUploadScreen; 