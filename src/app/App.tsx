import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { PaperProvider } from 'react-native-paper';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './providers/AuthProvider';
import { QueryProvider } from './providers/QueryProvider';
import { RepositoryProvider } from './providers/RepositoryProvider';
import { ThemeProvider, useAppTheme, lightTheme, darkTheme } from './providers/ThemeProvider';
import { RootNavigator } from './navigation/RootNavigator';
import { ResponsiveContainer } from '../shared/components/ResponsiveContainer';

function AppContent() {
  const { isDark } = useAppTheme();
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <PaperProvider theme={theme}>
        <QueryProvider>
          <RepositoryProvider>
            <AuthProvider>
              <ResponsiveContainer>
                <RootNavigator />
              </ResponsiveContainer>
              <StatusBar style={isDark ? 'light' : 'dark'} />
            </AuthProvider>
          </RepositoryProvider>
        </QueryProvider>
      </PaperProvider>
    </View>
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
