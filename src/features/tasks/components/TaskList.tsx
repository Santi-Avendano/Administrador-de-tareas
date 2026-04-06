import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, ActivityIndicator, Portal, Dialog, Button } from 'react-native-paper';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';
import { TaskItem } from './TaskItem';
import { useTasksForDay } from '../hooks/useTasks';
import { useToggleTaskCompletion, useDeleteTask, useReorderTasks } from '../hooks/useTaskMutations';
import { useTasksStore } from '../store/tasksStore';
import type { Task } from '../types';

export function TaskList() {
  const theme = useTheme();
  const { weekStartDate, selectedDay, setEditingTask } = useTasksStore();
  const { data: tasks, isLoading } = useTasksForDay(weekStartDate, selectedDay);
  const toggleTask = useToggleTaskCompletion(weekStartDate);
  const deleteTask = useDeleteTask(weekStartDate);
  const reorderTasks = useReorderTasks(weekStartDate);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return a.position - b.position;
    });
  }, [tasks]);

  const handleDelete = (task: Task) => {
    setDeleteTarget(task);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteTask.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleDragEnd = ({ data: reorderedTasks }: { data: Task[] }) => {
    const updates = reorderedTasks.map((task, index) => ({
      id: task.id,
      position: index,
    }));
    reorderTasks.mutate(updates);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <TaskItem
      task={item}
      onToggle={() => toggleTask(item)}
      onEdit={() => setEditingTask(item.id)}
      onDelete={() => handleDelete(item)}
      drag={drag}
      isActive={isActive}
    />
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (sortedTasks.length === 0) {
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

    return (
      <DraggableFlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onDragEnd={handleDragEnd}
        contentContainerStyle={styles.list}
        activationDistance={10}
      />
    );
  };

  return (
    <>
      {renderContent()}
      <Portal>
        <Dialog visible={deleteTarget !== null} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>Eliminar tarea</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              ¿Estás seguro de que querés eliminar "{deleteTarget?.title}"? Esta acción no se puede
              deshacer.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button textColor={theme.colors.error} onPress={handleDeleteConfirm}>
              Eliminar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
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
