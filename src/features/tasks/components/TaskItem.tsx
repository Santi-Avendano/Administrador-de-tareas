import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Checkbox, useTheme, IconButton } from 'react-native-paper';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleReminder: () => void;
  drag?: () => void;
  isActive?: boolean;
}

export function TaskItem({ task, onToggle, onEdit, onDelete, onToggleReminder, drag, isActive }: TaskItemProps) {
  const theme = useTheme();
  const completedColor = theme.dark ? '#B57272' : '#A05050';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.elevation.level1 },
        isActive && {
          backgroundColor: theme.colors.elevation.level3,
          elevation: 4,
        },
      ]}
    >
      <Pressable onLongPress={drag} style={styles.dragHandle}>
        <IconButton icon="drag-horizontal-variant" size={20} />
      </Pressable>

      <Pressable onPress={onToggle} style={styles.checkboxArea}>
        <Checkbox
          status={task.isCompleted ? 'checked' : 'unchecked'}
          onPress={onToggle}
        />
      </Pressable>

      <Pressable onPress={onEdit} style={styles.content}>
        {task.scheduledTime && (
          <Text
            variant="labelSmall"
            style={[
              styles.timeBadge,
              {
                color: task.isCompleted ? completedColor : theme.colors.primary,
                backgroundColor: task.isCompleted
                  ? theme.colors.surfaceVariant
                  : theme.colors.primaryContainer,
              },
            ]}
          >
            {task.scheduledTime}
          </Text>
        )}
        <Text
          variant="bodyLarge"
          style={[
            styles.title,
            task.isCompleted && {
              textDecorationLine: 'line-through',
              color: completedColor,
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
              task.isCompleted && { color: completedColor },
            ]}
            numberOfLines={1}
          >
            {task.description}
          </Text>
        )}
      </Pressable>

      {task.scheduledTime && !task.isCompleted && (
        <IconButton
          icon={task.reminderEnabled ? 'bell' : 'bell-outline'}
          size={20}
          onPress={onToggleReminder}
        />
      )}
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
    borderRadius: 12,
    marginVertical: 3,
    marginHorizontal: 4,
  },
  dragHandle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxArea: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingVertical: 8,
  },
  timeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
    fontWeight: '600',
    overflow: 'hidden',
  },
  title: {
    lineHeight: 24,
  },
  description: {
    opacity: 0.7,
    marginTop: 2,
  },
});
