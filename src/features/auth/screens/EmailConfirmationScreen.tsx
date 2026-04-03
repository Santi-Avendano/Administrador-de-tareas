import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../app/navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailConfirmation'>;

export function EmailConfirmationScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { email } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="email-check-outline"
          size={80}
          color={theme.colors.primary}
          style={styles.icon}
        />

        <Text variant="headlineMedium" style={styles.title}>
          Check your email
        </Text>

        <Text variant="bodyLarge" style={styles.description}>
          We sent a confirmation link to
        </Text>
        <Text variant="bodyLarge" style={[styles.email, { color: theme.colors.primary }]}>
          {email}
        </Text>
        <Text variant="bodyMedium" style={styles.hint}>
          Open the link in the email to activate your account, then come back here to sign in.
        </Text>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        >
          Go to Sign In
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
  },
  email: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    textAlign: 'center',
    opacity: 0.5,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  button: {
    minWidth: 200,
  },
});
