import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { TaskItem } from './TaskItem';
import { useTasksForDay } from '../hooks/useTasks';
import { useToggleTaskCompletion, useDeleteTask } from '../hooks/useTaskMutations';
import { useTasksStore } from '../store/tasksStore';
import type { Task } from '../types';

export function TaskList() {
  const theme = useTheme();
  const { weekStartDate, selectedDay, setEditingTask } = useTasksStore();
  const { data: tasks, isLoading, isRefetching, refetch } = useTasksForDay(
    weekStartDate,
    selectedDay
  );
  const toggleTask = useToggleTaskCompletion(weekStartDate);
  const deleteTask = useDeleteTask(weekStartDate);

  const handleDelete = (task: Task) => {
    deleteTask.mutate(task.id);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium" style={{ color: theme.colors.outline }}>
          No tasks for this day
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.outline, marginTop: 4 }}>
          Tap + to add a task
        </Text>
      </View>
    );
  }

  // Sort: incomplete first, then by position
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return a.position - b.position;
  });

  return (
    <FlatList
      data={sortedTasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TaskItem
          task={item}
          onToggle={() => toggleTask(item)}
          onEdit={() => setEditingTask(item.id)}
          onDelete={() => handleDelete(item)}
        />
      )}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          colors={[theme.colors.primary]}
        />
      }
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
    padding: 8,
  },
});
