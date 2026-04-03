import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Modal, Portal, TextInput, Button, Text, useTheme, HelperText } from 'react-native-paper';
import { useTasksStore } from '../store/tasksStore';
import { useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTaskMutations';
import { useTaskById } from '../hooks/useTasks';
import { getDayName } from '../../../shared/utils/dates';
import { isTaskValid, validateTask } from '../../../domain/validation/taskValidation';

export function TaskFormModal() {
  const theme = useTheme();
  const { isAddModalVisible, hideAddModal, editingTaskId, weekStartDate, selectedDay } =
    useTasksStore();

  const existingTask = useTaskById(weekStartDate, editingTaskId ?? '');
  const createTask = useCreateTask();
  const updateTask = useUpdateTask(weekStartDate);
  const deleteTask = useDeleteTask(weekStartDate);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isEditing = !!editingTaskId;
  const errors = validateTask(title);
  const showTitleError = submitted && !!errors.title;

  useEffect(() => {
    if (isAddModalVisible) {
      setSubmitted(false);
      setTitle(existingTask?.title ?? '');
      setDescription(existingTask?.description ?? '');
    }
  }, [isAddModalVisible, existingTask]);

  const handleSave = () => {
    setSubmitted(true);
    if (!isTaskValid(title)) return;

    if (isEditing && editingTaskId) {
      updateTask.mutate({
        id: editingTaskId,
        updates: { title: title.trim(), description: description.trim() || null },
      });
    } else {
      createTask.mutate({
        title: title.trim(),
        description: description.trim() || null,
        dayOfWeek: selectedDay,
        weekStartDate,
      });
    }

    hideAddModal();
  };

  const handleDelete = () => {
    if (editingTaskId) {
      deleteTask.mutate(editingTaskId);
      hideAddModal();
    }
  };

  const isLoading = createTask.isPending || updateTask.isPending;

  return (
    <Portal>
      <Modal
        visible={isAddModalVisible}
        onDismiss={hideAddModal}
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Text variant="titleLarge" style={styles.title}>
            {isEditing ? 'Editar tarea' : 'Nueva tarea'}
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.outline }]}>
            {getDayName(selectedDay, false)}
          </Text>

          <TextInput
            label="Título"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            autoFocus
            error={showTitleError}
          />
          {showTitleError && (
            <HelperText type="error" visible={showTitleError} style={styles.helperText}>
              {errors.title}
            </HelperText>
          )}

          <TextInput
            label="Descripción (opcional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <View style={styles.actions}>
            {isEditing && (
              <Button
                mode="outlined"
                onPress={handleDelete}
                textColor={theme.colors.error}
                style={styles.deleteButton}
              >
                Eliminar
              </Button>
            )}
            <View style={styles.spacer} />
            <Button mode="text" onPress={hideAddModal}>
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              disabled={isLoading}
              loading={isLoading}
            >
              {isEditing ? 'Guardar' : 'Agregar'}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 4,
  },
  helperText: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButton: {
    borderColor: 'transparent',
  },
  spacer: {
    flex: 1,
  },
});
