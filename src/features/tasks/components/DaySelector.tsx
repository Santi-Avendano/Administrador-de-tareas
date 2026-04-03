import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { DayOfWeek } from '../types';
import { useTasksStore } from '../store/tasksStore';
import { useTaskCountsByDay } from '../hooks/useTasks';
import { getDayName, formatDayDate, isToday } from '../../../shared/utils/dates';

const DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

export function DaySelector() {
  const theme = useTheme();
  const { weekStartDate, selectedDay, setSelectedDay } = useTasksStore();
  const taskCounts = useTaskCountsByDay(weekStartDate);

  return (
    <View style={styles.container}>
      {DAYS.map((day) => {
        const isSelected = selectedDay === day;
        const isTodayDay = isToday(weekStartDate, day);
        const counts = taskCounts[day];
        const hasIncompleteTasks = counts.total > counts.completed;

        return (
          <Pressable
            key={day}
            onPress={() => setSelectedDay(day)}
            style={[
              styles.dayButton,
              isSelected && { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <Text
              variant="labelSmall"
              style={[
                styles.dayName,
                isTodayDay && { color: theme.colors.primary, fontWeight: '700' },
                isSelected && { color: theme.colors.onPrimaryContainer },
              ]}
            >
              {getDayName(day)}
            </Text>
            <Text
              variant="titleMedium"
              style={[
                styles.dayDate,
                isTodayDay && { color: theme.colors.primary, fontWeight: '700' },
                isSelected && { color: theme.colors.onPrimaryContainer },
              ]}
            >
              {formatDayDate(weekStartDate, day)}
            </Text>
            <View style={styles.indicatorContainer}>
              {counts.total > 0 && (
                <View
                  style={[
                    styles.indicator,
                    {
                      backgroundColor: hasIncompleteTasks
                        ? theme.colors.primary
                        : theme.colors.outline,
                    },
                  ]}
                />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  dayName: {
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  dayDate: {
    marginTop: 2,
  },
  indicatorContainer: {
    height: 6,
    marginTop: 4,
    justifyContent: 'center',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
