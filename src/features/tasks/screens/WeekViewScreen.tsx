import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WeekHeader } from '../components/WeekHeader';
import { DaySelector } from '../components/DaySelector';
import { TaskList } from '../components/TaskList';
import { TaskFormModal } from '../components/TaskFormModal';
import { useTasksStore } from '../store/tasksStore';

export function WeekViewScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { showAddModal } = useTasksStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <WeekHeader />
      <DaySelector />
      <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
      <TaskList />
      <FAB
        icon="plus"
        style={[styles.fab, { bottom: 16 + insets.bottom }]}
        onPress={showAddModal}
      />
      <TaskFormModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
  },
});
