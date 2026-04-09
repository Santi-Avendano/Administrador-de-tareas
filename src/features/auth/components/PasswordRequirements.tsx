import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { PasswordRequirement } from '../../../domain/validation/authValidation';

interface Props {
  requirements: PasswordRequirement[];
}

export function PasswordRequirements({ requirements }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {requirements.map((req) => (
        <View key={req.key} style={styles.row}>
          <MaterialCommunityIcons
            name={req.met ? 'check-circle' : 'circle-outline'}
            size={16}
            color={req.met ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
          <Text
            variant="bodySmall"
            style={[
              styles.label,
              { color: req.met ? theme.colors.primary : theme.colors.onSurfaceVariant },
            ]}
          >
            {req.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    flex: 1,
  },
});
