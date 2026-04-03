import { useTasksStore } from '../store/tasksStore';
import { getPreviousWeekStart, getNextWeekStart, getWeekStartDate } from '../../../shared/utils/dates';

export function useWeekNavigation() {
  const { weekStartDate, setWeekStartDate, goToToday } = useTasksStore();

  const goToPreviousWeek = () => {
    setWeekStartDate(getPreviousWeekStart(weekStartDate));
  };

  const goToNextWeek = () => {
    setWeekStartDate(getNextWeekStart(weekStartDate));
  };

  const isCurrentWeek = weekStartDate === getWeekStartDate();

  return {
    weekStartDate,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    isCurrentWeek,
  };
}
