import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import HomeScreen from './screens/HomeScreen';
import VideoDetailScreen from './screens/VideoDetailScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
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
} 