import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Checkbox, useTheme, IconButton } from 'react-native-paper';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Pressable onPress={onToggle} style={styles.checkboxArea}>
        <Checkbox
          status={task.isCompleted ? 'checked' : 'unchecked'}
          onPress={onToggle}
        />
      </Pressable>

      <Pressable onPress={onEdit} style={styles.content}>
        <Text
          variant="bodyLarge"
          style={[
            styles.title,
            task.isCompleted && {
              textDecorationLine: 'line-through',
              color: theme.colors.outline,
            },
          ]}
        >
          {task.title}
        </Text>
        {task.description && (
          <Text
            variant="bodySmall"
            style={[
              styles.description,
              task.isCompleted && { color: theme.colors.outline },
            ]}
            numberOfLines={1}
          >
            {task.description}
          </Text>
        )}
      </Pressable>

      <IconButton icon="delete-outline" size={20} onPress={onDelete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 4,
  },
  checkboxArea: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingVertical: 8,
  },
  title: {
    lineHeight: 24,
  },
  description: {
    opacity: 0.7,
    marginTop: 2,
  },
});
