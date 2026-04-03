import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import type { AuthStackParamList } from '../../../app/navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, loading, error, clearError } = useAuth();

  const passwordsMatch = password === confirmPassword;
  const isValidPassword = password.length >= 6;

  const handleRegister = async () => {
    if (!email.trim() || !password || !passwordsMatch || !isValidPassword) return;

    const success = await signUp(email.trim(), password);
    if (success) {
      navigation.navigate('EmailConfirmation', { email: email.trim() });
    }
  };

  const goToLogin = () => {
    clearError();
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          Create Account
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Start organizing your week
        </Text>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          {password.length > 0 && !isValidPassword && (
            <HelperText type="error" visible>
              Password must be at least 6 characters
            </HelperText>
          )}

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <HelperText type="error" visible>
              Passwords do not match
            </HelperText>
          )}

          {error && (
            <HelperText type="error" visible={!!error}>
              {error.message}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading || !email.trim() || !passwordsMatch || !isValidPassword}
            style={styles.button}
          >
            Create Account
          </Button>

          <Button mode="text" onPress={goToLogin} style={styles.linkButton}>
            Already have an account? Sign In
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  form: {
    gap: 12,
  },
  input: {
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
  },
  linkButton: {
    marginTop: 8,
  },
});
