import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Divider, Button, Text, useTheme, Switch } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSession } from '../../../app/providers/AuthProvider';
import { useAppTheme } from '../../../app/providers/ThemeProvider';

export function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const { signOut, loading } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
    >
      <Text variant="headlineMedium" style={styles.header}>
        Settings
      </Text>

      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="Email"
          description={user?.email ?? 'Not signed in'}
          left={(props) => <List.Icon {...props} icon="email" />}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark mode"
          left={(props) => <List.Icon {...props} icon={isDark ? 'weather-night' : 'weather-sunny'} />}
          right={() => <Switch value={isDark} onValueChange={toggleTheme} />}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>About</List.Subheader>
        <List.Item
          title="Version"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information" />}
        />
      </List.Section>

      <Divider />

      <View style={styles.signOutSection}>
        <Button
          mode="outlined"
          onPress={signOut}
          loading={loading}
          disabled={loading}
          textColor={theme.colors.error}
          style={styles.signOutButton}
        >
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  signOutSection: {
    padding: 16,
    marginTop: 16,
  },
  signOutButton: {
    borderColor: 'transparent',
  },
});
