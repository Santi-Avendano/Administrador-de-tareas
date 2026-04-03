import { useState } from 'react';
import { useAuthService } from '../../../app/providers/RepositoryProvider';

interface AuthError {
  message: string;
}

export function useAuth() {
  const authService = useAuthService();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const result = await authService.signUp(email, password);
    setLoading(false);

    if (!result.success) {
      setError({ message: result.error ?? 'Error al registrarse' });
      return false;
    }

    return true;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const result = await authService.signIn(email, password);
    setLoading(false);

    if (!result.success) {
      setError({ message: result.error ?? 'Error al iniciar sesión' });
      return false;
    }

    return true;
  };

  const signOut = async () => {
    setLoading(true);
    await authService.signOut();
    setLoading(false);
  };

  const clearError = () => setError(null);

  return {
    signUp,
    signIn,
    signOut,
    loading,
    error,
    clearError,
  };
}
