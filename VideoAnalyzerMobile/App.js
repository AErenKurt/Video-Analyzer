import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import VideoDetailScreen from './src/screens/VideoDetailScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Video Analiz Sistemi'}}
        />
        <Stack.Screen
          name="VideoDetail"
          component={VideoDetailScreen}
          options={{title: 'Video Detayları'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App; 