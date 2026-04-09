import { useTasksStore } from '../store/tasksStore';
import {
  getPreviousWeekStart,
  getNextWeekStart,
  getWeekStartDate,
  getMaxFutureWeekStart,
  getMinPastWeekStart,
} from '../../../shared/utils/dates';

export function useWeekNavigation() {
  const { weekStartDate, setWeekStartDate, goToToday } = useTasksStore();

  const maxWeekStart = getMaxFutureWeekStart();
  const minWeekStart = getMinPastWeekStart();
  const canGoForward = weekStartDate < maxWeekStart;
  const canGoBackward = weekStartDate > minWeekStart;

  const goToPreviousWeek = () => {
    const prev = getPreviousWeekStart(weekStartDate);
    if (prev >= minWeekStart) {
      setWeekStartDate(prev);
    }
  };

  const goToNextWeek = () => {
    const next = getNextWeekStart(weekStartDate);
    if (next <= maxWeekStart) {
      setWeekStartDate(next);
    }
  };

  const isCurrentWeek = weekStartDate === getWeekStartDate();

  return {
    weekStartDate,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    isCurrentWeek,
    canGoForward,
    canGoBackward,
  };
}
