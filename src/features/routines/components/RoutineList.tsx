import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { RoutineCard } from './RoutineCard';
import { useRoutines } from '../hooks/useRoutines';
import { useToggleRoutineActive } from '../hooks/useRoutineMutations';
import { useRoutinesStore } from '../store/routinesStore';
import type { RoutineWithItems } from '../types';

export function RoutineList() {
  const theme = useTheme();
  const { data: routines, isLoading } = useRoutines();
  const toggleActive = useToggleRoutineActive();
  const { setEditingRoutine } = useRoutinesStore();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!routines || routines.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium" style={{ color: theme.colors.outline }}>
          No tenés rutinas
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.outline, marginTop: 4 }}>
          Tocá + para crear una rutina
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={routines}
      keyExtractor={(item) => item.id}
      renderItem={({ item }: { item: RoutineWithItems }) => (
        <RoutineCard
          routine={item}
          onPress={() => setEditingRoutine(item.id)}
          onToggleActive={() => toggleActive(item)}
        />
      )}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  list: {
    paddingTop: 12,
    paddingBottom: 80,
  },
});
