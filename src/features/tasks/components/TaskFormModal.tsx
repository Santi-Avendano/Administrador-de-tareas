import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Modal,
  Portal,
  TextInput,
  Button,
  Text,
  useTheme,
  HelperText,
  Dialog,
  Switch,
  Chip,
} from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import { useTasksStore } from '../store/tasksStore';
import { useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTaskMutations';
import { useTaskById } from '../hooks/useTasks';
import { getDayName } from '../../../shared/utils/dates';
import { isTaskValid, validateTask, formatTime } from '../../../domain/validation/taskValidation';

export function TaskFormModal() {
  const theme = useTheme();
  const { isAddModalVisible, hideAddModal, editingTaskId, weekStartDate, selectedDay } =
    useTasksStore();

  const existingTask = useTaskById(weekStartDate, editingTaskId ?? '');
  const createTask = useCreateTask(weekStartDate);
  const updateTask = useUpdateTask(weekStartDate);
  const deleteTask = useDeleteTask(weekStartDate);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [hasTime, setHasTime] = useState(false);
  const [hours, setHours] = useState(9);
  const [minutes, setMinutes] = useState(0);
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  const isEditing = !!editingTaskId;
  const errors = validateTask(title);
  const showTitleError = submitted && !!errors.title;

  useEffect(() => {
    if (isAddModalVisible) {
      setSubmitted(false);
      setTitle(existingTask?.title ?? '');
      setDescription(existingTask?.description ?? '');

      if (existingTask?.scheduledTime) {
        setHasTime(true);
        const [h, m] = existingTask.scheduledTime.split(':').map(Number);
        setHours(h);
        setMinutes(m);
      } else {
        setHasTime(false);
        setHours(9);
        setMinutes(0);
      }
    }
  }, [isAddModalVisible, existingTask]);

  const handleSave = () => {
    setSubmitted(true);
    if (!isTaskValid(title)) return;

    const scheduledTime = hasTime ? formatTime(hours, minutes) : null;

    if (isEditing && editingTaskId) {
      updateTask.mutate({
        id: editingTaskId,
        updates: {
          title: title.trim(),
          description: description.trim() || null,
          scheduledTime,
        },
      });
    } else {
      createTask.mutate({
        title: title.trim(),
        description: description.trim() || null,
        dayOfWeek: selectedDay,
        weekStartDate,
        scheduledTime,
      });
    }

    hideAddModal();
  };

  const handleDeletePress = () => {
    setConfirmDeleteVisible(true);
  };

  const handleDeleteConfirm = () => {
    setConfirmDeleteVisible(false);
    if (editingTaskId) {
      deleteTask.mutate(editingTaskId);
      hideAddModal();
    }
  };

  const handleTimeConfirm = ({ hours: h, minutes: m }: { hours: number; minutes: number }) => {
    setHours(h);
    setMinutes(m);
    setTimePickerVisible(false);
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

          <View style={styles.timeRow}>
            <Text variant="bodyMedium">Programar hora</Text>
            <Switch value={hasTime} onValueChange={setHasTime} />
          </View>

          {hasTime && (
            <Chip
              icon="clock-outline"
              onPress={() => setTimePickerVisible(true)}
              style={styles.timeChip}
              mode="outlined"
            >
              {formatTime(hours, minutes)}
            </Chip>
          )}

          <View style={styles.actions}>
            {isEditing && (
              <Button
                mode="outlined"
                onPress={handleDeletePress}
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

      <TimePickerModal
        visible={timePickerVisible}
        onDismiss={() => setTimePickerVisible(false)}
        onConfirm={handleTimeConfirm}
        hours={hours}
        minutes={minutes}
        label="Seleccionar hora"
        cancelLabel="Cancelar"
        confirmLabel="Aceptar"
        use24HourClock
      />

      <Dialog visible={confirmDeleteVisible} onDismiss={() => setConfirmDeleteVisible(false)}>
        <Dialog.Title>Eliminar tarea</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            ¿Estás seguro de que querés eliminar "{existingTask?.title}"? Esta acción no se puede deshacer.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setConfirmDeleteVisible(false)}>Cancelar</Button>
          <Button textColor={theme.colors.error} onPress={handleDeleteConfirm}>
            Eliminar
          </Button>
        </Dialog.Actions>
      </Dialog>
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  timeChip: {
    alignSelf: 'flex-start',
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
