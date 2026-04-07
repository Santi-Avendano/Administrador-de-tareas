import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Modal,
  Portal,
  TextInput,
  Button,
  Text,
  useTheme,
  HelperText,
  Dialog,
} from 'react-native-paper';
import { useRoutinesStore } from '../store/routinesStore';
import { useCreateRoutine, useDeleteRoutine } from '../hooks/useRoutineMutations';
import { useRoutineById } from '../hooks/useRoutines';
import { isRoutineValid, validateRoutine } from '../../../domain/validation/routineValidation';
import { RoutineItemRow } from './RoutineItemRow';
import type { DayOfWeek } from '../../../domain/entities/task';
import type { RoutineItemInsert } from '../types';
import { formatTime } from '../../../domain/validation/taskValidation';

interface ItemFormState {
  title: string;
  selectedDays: DayOfWeek[];
  hours: number;
  minutes: number;
  hasTime: boolean;
}

const defaultItem = (): ItemFormState => ({
  title: '',
  selectedDays: [0],
  hours: 9,
  minutes: 0,
  hasTime: true,
});

export function RoutineFormModal() {
  const theme = useTheme();
  const { isFormModalVisible, hideFormModal, editingRoutineId } = useRoutinesStore();

  const { data: existingRoutine } = useRoutineById(editingRoutineId ?? '');
  const createRoutine = useCreateRoutine();
  const deleteRoutine = useDeleteRoutine();

  const [name, setName] = useState('');
  const [items, setItems] = useState<ItemFormState[]>([defaultItem()]);
  const [submitted, setSubmitted] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const isEditing = !!editingRoutineId;

  const itemInserts: RoutineItemInsert[] = items.flatMap((item) =>
    item.selectedDays.map((day) => ({
      title: item.title,
      dayOfWeek: day,
      scheduledTime: item.hasTime ? formatTime(item.hours, item.minutes) : null,
    }))
  );

  const errors = validateRoutine(name, itemInserts);
  const showNameError = submitted && !!errors.name;
  const showItemsError = submitted && !!errors.items;

  useEffect(() => {
    if (isFormModalVisible) {
      setSubmitted(false);
      if (existingRoutine) {
        setName(existingRoutine.name);
        const grouped = new Map<string, { title: string; scheduledTime: string | null; days: DayOfWeek[] }>();
        for (const item of existingRoutine.items) {
          const key = `${item.title}|${item.scheduledTime ?? ''}`;
          const existing = grouped.get(key);
          if (existing) {
            existing.days.push(item.dayOfWeek);
          } else {
            grouped.set(key, { title: item.title, scheduledTime: item.scheduledTime, days: [item.dayOfWeek] });
          }
        }
        setItems(
          Array.from(grouped.values()).map(({ title, scheduledTime, days }) => {
            const hasTime = !!scheduledTime;
            const [h, m] = hasTime ? scheduledTime!.split(':').map(Number) : [9, 0];
            return {
              title,
              selectedDays: days.sort((a, b) => a - b) as DayOfWeek[],
              hours: h,
              minutes: m,
              hasTime,
            };
          })
        );
      } else {
        setName('');
        setItems([defaultItem()]);
      }
    }
  }, [isFormModalVisible, existingRoutine]);

  const updateItem = (index: number, updates: Partial<ItemFormState>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems((prev) => [...prev, defaultItem()]);
  };

  const handleSave = () => {
    setSubmitted(true);
    if (!isRoutineValid(name, itemInserts)) return;

    createRoutine.mutate({
      name: name.trim(),
      items: itemInserts.map((item) => ({
        ...item,
        title: item.title.trim(),
      })),
    });

    hideFormModal();
  };

  const handleDeleteConfirm = () => {
    setConfirmDeleteVisible(false);
    if (editingRoutineId) {
      deleteRoutine.mutate(editingRoutineId);
      hideFormModal();
    }
  };

  const isLoading = createRoutine.isPending;

  return (
    <Portal>
      <Modal
        visible={isFormModalVisible}
        onDismiss={hideFormModal}
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Text variant="titleLarge" style={styles.title}>
            {isEditing ? 'Editar rutina' : 'Nueva rutina'}
          </Text>

          <TextInput
            label="Nombre de la rutina"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            autoFocus
            error={showNameError}
          />
          {showNameError && (
            <HelperText type="error" visible={showNameError}>
              {errors.name}
            </HelperText>
          )}

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Tareas
          </Text>

          {showItemsError && (
            <HelperText type="error" visible={showItemsError}>
              {errors.items}
            </HelperText>
          )}

          <ScrollView style={styles.itemsScroll}>
            {items.map((item, index) => (
              <RoutineItemRow
                key={index}
                title={item.title}
                selectedDays={item.selectedDays}
                hours={item.hours}
                minutes={item.minutes}
                hasTime={item.hasTime}
                onTitleChange={(t) => updateItem(index, { title: t })}
                onDaysChange={(days) => updateItem(index, { selectedDays: days })}
                onTimeChange={(h, m) => updateItem(index, { hours: h, minutes: m })}
                onHasTimeChange={(ht) => updateItem(index, { hasTime: ht })}
                onRemove={() => removeItem(index)}
                showRemove={items.length > 1}
              />
            ))}
          </ScrollView>

          <Button
            mode="text"
            icon="plus"
            onPress={addItem}
            style={styles.addButton}
          >
            Agregar tarea
          </Button>

          <View style={styles.actions}>
            {isEditing && (
              <Button
                mode="outlined"
                onPress={() => setConfirmDeleteVisible(true)}
                textColor={theme.colors.error}
                style={styles.deleteButton}
              >
                Eliminar
              </Button>
            )}
            <View style={styles.spacer} />
            <Button mode="text" onPress={hideFormModal}>
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              disabled={isLoading}
              loading={isLoading}
            >
              {isEditing ? 'Guardar' : 'Crear rutina'}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Dialog visible={confirmDeleteVisible} onDismiss={() => setConfirmDeleteVisible(false)}>
        <Dialog.Title>Eliminar rutina</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Se eliminará la rutina y todas las tareas futuras pendientes generadas por ella.
            Las tareas ya completadas se conservan.
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
    maxHeight: '85%',
  },
  title: {
    marginBottom: 12,
  },
  input: {
    marginBottom: 4,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  itemsScroll: {
    maxHeight: 300,
  },
  addButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButton: {
    borderColor: 'transparent',
  },
  spacer: {
    flex: 1,
  },
});
