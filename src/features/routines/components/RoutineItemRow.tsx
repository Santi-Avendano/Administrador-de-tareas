import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton, Chip, useTheme } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import type { DayOfWeek } from '../../../domain/entities/task';
import { getDayName } from '../../../shared/utils/dates';
import { formatTime } from '../../../domain/validation/taskValidation';

const DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

interface RoutineItemRowProps {
  title: string;
  selectedDays: DayOfWeek[];
  hours: number;
  minutes: number;
  hasTime: boolean;
  onTitleChange: (title: string) => void;
  onDaysChange: (days: DayOfWeek[]) => void;
  onTimeChange: (hours: number, minutes: number) => void;
  onHasTimeChange: (hasTime: boolean) => void;
  onRemove: () => void;
  showRemove: boolean;
}

export function RoutineItemRow({
  title,
  selectedDays,
  hours,
  minutes,
  hasTime,
  onTitleChange,
  onDaysChange,
  onTimeChange,
  onHasTimeChange,
  onRemove,
  showRemove,
}: RoutineItemRowProps) {
  const theme = useTheme();
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  const handleDayPress = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        onDaysChange(selectedDays.filter(d => d !== day));
      }
    } else {
      onDaysChange([...selectedDays, day].sort((a, b) => a - b) as DayOfWeek[]);
    }
  };

  return (
    <View style={[styles.container, { borderColor: theme.colors.outlineVariant }]}>
      <View style={styles.topRow}>
        <TextInput
          label="Título"
          value={title}
          onChangeText={onTitleChange}
          mode="outlined"
          style={styles.titleInput}
          dense
        />
        {showRemove && (
          <IconButton icon="close" size={20} onPress={onRemove} />
        )}
      </View>

      <View style={styles.daysRow}>
        {DAYS.map((day) => (
          <Chip
            key={day}
            selected={selectedDays.includes(day)}
            onPress={() => handleDayPress(day)}
            compact
            style={styles.dayChip}
            textStyle={styles.dayChipText}
          >
            {getDayName(day)}
          </Chip>
        ))}
      </View>

      <View style={styles.timeRow}>
        <Chip
          icon={hasTime ? 'clock-outline' : 'clock-plus-outline'}
          onPress={() => {
            if (hasTime) {
              setTimePickerVisible(true);
            } else {
              onHasTimeChange(true);
              setTimePickerVisible(true);
            }
          }}
          onClose={hasTime ? () => onHasTimeChange(false) : undefined}
          mode="outlined"
          compact
        >
          {hasTime ? formatTime(hours, minutes) : 'Sin hora'}
        </Chip>
      </View>

      <TimePickerModal
        visible={timePickerVisible}
        onDismiss={() => setTimePickerVisible(false)}
        onConfirm={({ hours: h, minutes: m }) => {
          onTimeChange(h, m);
          onHasTimeChange(true);
          setTimePickerVisible(false);
        }}
        hours={hours}
        minutes={minutes}
        label="Seleccionar hora"
        cancelLabel="Cancelar"
        confirmLabel="Aceptar"
        use24HourClock
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleInput: {
    flex: 1,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  dayChip: {
    height: 32,
  },
  dayChipText: {
    fontSize: 11,
  },
  timeRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
});
