import { useTasksStore } from '../store/tasksStore';
import {
  getPreviousWeekStart,
  getNextWeekStart,
  getWeekStartDate,
  getMaxFutureWeekStart,
} from '../../../shared/utils/dates';

export function useWeekNavigation() {
  const { weekStartDate, setWeekStartDate, goToToday } = useTasksStore();

  const maxWeekStart = getMaxFutureWeekStart();
  const canGoForward = weekStartDate < maxWeekStart;

  const goToPreviousWeek = () => {
    setWeekStartDate(getPreviousWeekStart(weekStartDate));
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
  };
}
