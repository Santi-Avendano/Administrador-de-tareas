import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './providers/AuthProvider';
import { QueryProvider } from './providers/QueryProvider';
import { RepositoryProvider } from './providers/RepositoryProvider';
import { ThemeProvider, useAppTheme, lightTheme, darkTheme } from './providers/ThemeProvider';
import { RootNavigator } from './navigation/RootNavigator';

function AppContent() {
  const { isDark } = useAppTheme();
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <QueryProvider>
        <RepositoryProvider>
          <AuthProvider>
            <RootNavigator />
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </AuthProvider>
        </RepositoryProvider>
      </QueryProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
