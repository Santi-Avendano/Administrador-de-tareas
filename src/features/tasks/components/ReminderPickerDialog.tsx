import React, { useState, useEffect } from 'react';
import { Portal, Dialog, Button } from 'react-native-paper';
import { ReminderTimePicker } from './ReminderTimePicker';

interface ReminderPickerDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (minutes: number) => void;
  initialValue?: number;
}

export function ReminderPickerDialog({
  visible,
  onDismiss,
  onConfirm,
  initialValue = 15,
}: ReminderPickerDialogProps) {
  const [selectedValue, setSelectedValue] = useState(String(initialValue));

  useEffect(() => {
    if (visible) {
      setSelectedValue(String(initialValue));
    }
  }, [visible, initialValue]);

  const handleConfirm = () => {
    const minutes = parseInt(selectedValue, 10);
    if (isNaN(minutes) || minutes <= 0) {
      onDismiss();
      return;
    }
    if (minutes <= 1440) {
      onConfirm(minutes);
    }
  };

  const handleDismiss = () => {
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss}>
        <Dialog.Title>Recordatorio</Dialog.Title>
        <Dialog.Content>
          <ReminderTimePicker value={selectedValue} onValueChange={setSelectedValue} />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleDismiss}>Cancelar</Button>
          <Button onPress={handleConfirm}>Aceptar</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
