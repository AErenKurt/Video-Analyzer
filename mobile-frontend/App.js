import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import AppNavigator from './AppNavigator';
import { COLORS } from './config';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor={COLORS.primary}
        barStyle="light-content"
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App; 