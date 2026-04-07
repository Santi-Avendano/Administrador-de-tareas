import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, Button, useTheme } from 'react-native-paper';
import { useWeekNavigation } from '../hooks/useWeekNavigation';
import { formatWeekRange } from '../../../shared/utils/dates';

export function WeekHeader() {
  const theme = useTheme();
  const { weekStartDate, goToPreviousWeek, goToNextWeek, goToToday, isCurrentWeek, canGoForward } =
    useWeekNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        <IconButton icon="chevron-left" onPress={goToPreviousWeek} size={24} />
        <View style={styles.center}>
          <Text variant="titleMedium">{formatWeekRange(weekStartDate)}</Text>
          {!isCurrentWeek && (
            <Button
              mode="text"
              compact
              onPress={goToToday}
              labelStyle={{ fontSize: 12 }}
            >
              Today
            </Button>
          )}
        </View>
        <IconButton icon="chevron-right" onPress={goToNextWeek} size={24} disabled={!canGoForward} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
  },
});
