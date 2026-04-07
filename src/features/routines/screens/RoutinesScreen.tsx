import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoutineList } from '../components/RoutineList';
import { RoutineFormModal } from '../components/RoutineFormModal';
import { useRoutinesStore } from '../store/routinesStore';

export function RoutinesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { showFormModal } = useRoutinesStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.header}>
        Rutinas
      </Text>
      <RoutineList />
      <FAB
        icon="plus"
        style={[styles.fab, { bottom: 16 + insets.bottom }]}
        onPress={showFormModal}
      />
      <RoutineFormModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
  },
});
