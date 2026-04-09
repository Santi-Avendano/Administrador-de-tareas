import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { WeekViewScreen } from '../../features/tasks/screens/WeekViewScreen';
import { RoutinesScreen } from '../../features/routines/screens/RoutinesScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import { useTaskCleanup } from '../../features/tasks/hooks/useTaskCleanup';

export type MainTabParamList = {
  Week: undefined;
  Routines: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  const theme = useTheme();
  useTaskCleanup();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: { backgroundColor: theme.colors.surface },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Week"
        component={WeekViewScreen}
        options={{
          tabBarLabel: 'Semana',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-week" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Routines"
        component={RoutinesScreen}
        options={{
          tabBarLabel: 'Rutinas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="repeat" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Configuración',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
