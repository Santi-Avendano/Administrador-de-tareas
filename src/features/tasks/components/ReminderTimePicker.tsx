import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, type TextInput as RNTextInput } from 'react-native';
import { Chip, TextInput, HelperText, Text } from 'react-native-paper';

const PRESETS = [
  { value: '5', label: '5 min' },
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '60', label: '1 h' },
];

const PRESET_VALUES = PRESETS.map(p => p.value);

function minutesToHHmm(totalMinutes: number): { hh: string; mm: string } {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return { hh: String(h).padStart(2, '0'), mm: String(m).padStart(2, '0') };
}

function hhmmToMinutes(hh: string, mm: string): number {
  return (parseInt(hh, 10) || 0) * 60 + (parseInt(mm, 10) || 0);
}

interface ReminderTimePickerProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ReminderTimePicker({ value, onValueChange }: ReminderTimePickerProps) {
  const isCustomInitial = !PRESET_VALUES.includes(value) && value !== '0';
  const initialHHmm = isCustomInitial ? minutesToHHmm(parseInt(value, 10) || 0) : { hh: '', mm: '' };

  const [isCustomMode, setIsCustomMode] = useState(isCustomInitial);
  const [hh, setHh] = useState(initialHHmm.hh);
  const [mm, setMm] = useState(initialHHmm.mm);
  const [customError, setCustomError] = useState('');
  const mmRef = useRef<RNTextInput>(null);

  useEffect(() => {
    const parsed = parseInt(value, 10);
    if (!PRESET_VALUES.includes(value) && parsed > 0 && !isCustomMode) {
      setIsCustomMode(true);
      const hhMm = minutesToHHmm(parsed);
      setHh(hhMm.hh);
      setMm(hhMm.mm);
    }
  }, [value]);

  const validate = (hours: string, minutes: string): string => {
    if (hours === '' || minutes === '') return '';
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    if (isNaN(h) || isNaN(m)) return '';
    if (h < 0 || h > 24) return 'Las horas deben estar entre 0 y 24';
    if (m < 0 || m > 59) return 'Los minutos deben estar entre 0 y 59';
    if (h === 24 && m > 0) return 'El máximo es 24:00';
    return '';
  };

  const emitValue = (hours: string, minutes: string) => {
    const error = validate(hours, minutes);
    setCustomError(error);
    if (!error && hours !== '' && minutes !== '') {
      onValueChange(String(hhmmToMinutes(hours, minutes)));
    }
  };

  const handlePresetPress = (presetValue: string) => {
    setIsCustomMode(false);
    setCustomError('');
    setHh('');
    setMm('');
    onValueChange(presetValue);
  };

  const handleCustomPress = () => {
    setIsCustomMode(true);
    setHh('');
    setMm('');
  };

  const handleHhChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    setHh(cleaned);
    emitValue(cleaned, mm);
    if (cleaned.length === 2) {
      mmRef.current?.focus();
    }
  };

  const handleMmChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    setMm(cleaned);
    emitValue(hh, cleaned);
  };

  const handleHhBlur = () => {
    if (hh === '') return;
    const padded = hh.padStart(2, '0');
    setHh(padded);
    emitValue(padded, mm);
  };

  const handleMmBlur = () => {
    if (mm === '') return;
    const padded = mm.padStart(2, '0');
    setMm(padded);
    emitValue(hh, padded);
  };

  return (
    <View>
      <View style={styles.chipsRow}>
        {PRESETS.map(preset => (
          <Chip
            key={preset.value}
            selected={!isCustomMode && value === preset.value}
            onPress={() => handlePresetPress(preset.value)}
            style={styles.chip}
            showSelectedOverlay
          >
            {preset.label}
          </Chip>
        ))}
        <Chip
          selected={isCustomMode}
          onPress={handleCustomPress}
          style={styles.chip}
          showSelectedOverlay
        >
          Otro
        </Chip>
      </View>

      {isCustomMode && (
        <View style={styles.customRow}>
          <Text variant="bodySmall" style={styles.customLabel}>
            Tiempo antes (HH:mm)
          </Text>
          <View style={styles.timeInputRow}>
            <TextInput
              mode="outlined"
              label="HH"
              placeholder="00"
              value={hh}
              onChangeText={handleHhChange}
              onBlur={handleHhBlur}
              keyboardType="number-pad"
              style={styles.timeInput}
              maxLength={2}
              dense
            />
            <Text variant="headlineSmall" style={styles.timeSeparator}>:</Text>
            <TextInput
              ref={mmRef}
              mode="outlined"
              label="mm"
              placeholder="00"
              value={mm}
              onChangeText={handleMmChange}
              onBlur={handleMmBlur}
              keyboardType="number-pad"
              style={styles.timeInput}
              maxLength={2}
              dense
            />
          </View>
          {customError !== '' && (
            <HelperText type="error" visible>
              {customError}
            </HelperText>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  customRow: {
    marginTop: 12,
  },
  customLabel: {
    marginBottom: 8,
    opacity: 0.7,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeInput: {
    width: 72,
    textAlign: 'center',
  },
  timeSeparator: {
    marginHorizontal: 4,
    fontWeight: 'bold',
  },
});
