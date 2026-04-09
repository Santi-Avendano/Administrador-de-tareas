import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const THEME_STORAGE_KEY = '@app_theme_mode';

const lightColors = {
  primary: '#1565C0',
  primaryContainer: '#BBDEFB',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#0D47A1',
  secondary: '#546E7A',
  secondaryContainer: '#CFD8DC',
};

const darkColors = {
  primary: '#64B5F6',
  primaryContainer: '#1565C0',
  onPrimary: '#0D47A1',
  onPrimaryContainer: '#BBDEFB',
  secondary: '#78909C',
  secondaryContainer: '#37474F',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, ...lightColors },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, ...darkColors },
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

export function useAppTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((value) => {
      if (value === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
