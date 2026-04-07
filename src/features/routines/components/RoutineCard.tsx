import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, Switch, useTheme } from 'react-native-paper';
import type { RoutineWithItems } from '../types';
import { getDayName } from '../../../shared/utils/dates';

interface RoutineCardProps {
  routine: RoutineWithItems;
  onPress: () => void;
  onToggleActive: () => void;
}

export function RoutineCard({ routine, onPress, onToggleActive }: RoutineCardProps) {
  const theme = useTheme();

  const grouped = new Map<string, { scheduledTime: string | null; days: string[] }>();
  for (const item of routine.items) {
    const key = `${item.title}|${item.scheduledTime ?? ''}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.days.push(getDayName(item.dayOfWeek));
    } else {
      grouped.set(key, { scheduledTime: item.scheduledTime, days: [getDayName(item.dayOfWeek)] });
    }
  }
  const summary = Array.from(grouped.entries())
    .map(([key, { scheduledTime, days }]) => {
      const title = key.split('|')[0];
      const daysStr = days.join(', ');
      return scheduledTime ? `${title}: ${daysStr} ${scheduledTime}` : `${title}: ${daysStr}`;
    })
    .join(' · ');

  return (
    <Card style={styles.card} onPress={onPress} mode="outlined">
      <Card.Title
        title={routine.name}
        titleVariant="titleMedium"
        right={() => (
          <Switch
            value={routine.isActive}
            onValueChange={onToggleActive}
            style={styles.switch}
          />
        )}
      />
      <Card.Content>
        <Text
          variant="bodySmall"
          style={[styles.summary, { color: theme.colors.onSurfaceVariant }]}
          numberOfLines={2}
        >
          {summary || 'Sin tareas configuradas'}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  switch: {
    marginRight: 16,
  },
  summary: {
    marginTop: -4,
    marginBottom: 8,
  },
});
