import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import VideoDetailScreen from './screens/VideoDetailScreen';
import { API_URL } from './config';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // WebSocket bağlantısını oluştur
    const ws = new WebSocket('ws://localhost:8000/ws/analysis/');

    ws.onopen = () => {
      console.log('WebSocket bağlantısı kuruldu');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket mesajı:', data);
      // Burada gelen mesajları işleyebilirsiniz
    };

    ws.onerror = (error) => {
      console.error('WebSocket hatası:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket bağlantısı kapandı');
    };

    setSocket(ws);

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4a6da7',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Video Analiz Sistemi',
          }}
        />
        <Stack.Screen 
          name="VideoDetail" 
          component={VideoDetailScreen}
          options={({ route }) => ({ 
            title: route.params?.title || 'Video Detayları',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 