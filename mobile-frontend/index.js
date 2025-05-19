import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { ErrorBoundary } from 'react-error-boundary';
import { COLORS } from './config';

// Gereksiz uyarıları gizle
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

// Hata sınırı bileşeni
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.danger, marginBottom: 10 }}>
        Bir hata oluştu
      </Text>
      <Text style={{ color: COLORS.text.primary, marginBottom: 20, textAlign: 'center' }}>
        {error.message}
      </Text>
      <TouchableOpacity
        onPress={resetErrorBoundary}
        style={{
          backgroundColor: COLORS.primary,
          padding: 10,
          borderRadius: 5,
        }}>
        <Text style={{ color: COLORS.text.light }}>Tekrar Dene</Text>
      </TouchableOpacity>
    </View>
  );
};

// Ana uygulama bileşeni
const AppWithErrorBoundary = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Uygulamayı yeniden başlat
        AppRegistry.unregisterComponent(appName);
        AppRegistry.registerComponent(appName, () => AppWithErrorBoundary);
      }}>
      <App />
    </ErrorBoundary>
  );
};

AppRegistry.registerComponent(appName, () => AppWithErrorBoundary); 