import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import type { AuthStackParamList } from '../../../app/navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, error, clearError } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    await signIn(email.trim(), password);
  };

  const goToRegister = () => {
    clearError();
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          Tareas Semanales
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Planea tu semana, un día a la vez
        </Text>

        <View style={styles.form}>
          <TextInput
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Contraseña"
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

          {error && (
            <HelperText type="error" visible={!!error}>
              {error.message}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading || !email.trim() || !password}
            style={styles.button}
          >
            Iniciar sesión
          </Button>

          <Button mode="text" onPress={goToRegister} style={styles.linkButton}>
            ¿No tienes una cuenta? Regístrate
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
