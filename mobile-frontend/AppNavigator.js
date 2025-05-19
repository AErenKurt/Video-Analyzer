import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { BackHandler, Alert, View } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import VideoDetailScreen from './screens/VideoDetailScreen';
import VideoUploadScreen from './screens/VideoUploadScreen';
import { API_URL, WS_URL, COLORS, APP_CONFIG } from './config';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket(`${WS_URL}/analysis/`);

      ws.onopen = () => {
        console.log('WebSocket bağlantısı kuruldu');
        setIsConnected(true);
        setReconnectAttempt(0);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket mesajı:', data);
          // Burada gelen mesajları işleyebilirsiniz
        } catch (error) {
          console.error('WebSocket mesaj işleme hatası:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket hatası:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket bağlantısı kapandı');
        setIsConnected(false);

        // Yeniden bağlanma denemesi
        if (reconnectAttempt < APP_CONFIG.maxRetryAttempts) {
          setTimeout(() => {
            setReconnectAttempt(prev => prev + 1);
            connectWebSocket();
          }, 5000); // 5 saniye sonra tekrar dene
        }
      };

      setSocket(ws);
    } catch (error) {
      console.error('WebSocket bağlantı hatası:', error);
    }
  }, [reconnectAttempt]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connectWebSocket]);

  // Geri tuşu kontrolü
  useEffect(() => {
    const backAction = () => {
      Alert.alert('Çıkış', 'Uygulamadan çıkmak istediğinize emin misiniz?', [
        {
          text: 'İptal',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Çıkış',
          onPress: () => BackHandler.exitApp(),
        },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: COLORS.text.light,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
          cardStyle: { backgroundColor: COLORS.background },
          cardShadowEnabled: false,
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Video Analiz Sistemi',
            headerRight: () => (
              isConnected ? (
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.success, marginRight: 15 }} />
              ) : (
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.danger, marginRight: 15 }} />
              )
            ),
          }}
        />
        <Stack.Screen
          name="VideoUpload"
          component={VideoUploadScreen}
          options={{
            title: 'Video Yükle',
            headerBackTitle: 'Geri',
          }}
        />
        <Stack.Screen
          name="VideoDetail"
          component={VideoDetailScreen}
          options={({ route }) => ({
            title: route.params?.title || 'Video Detayları',
            headerBackTitle: 'Geri',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 