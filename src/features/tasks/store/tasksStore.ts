import { create } from 'zustand';
import type { DayOfWeek } from '../types';
import { getWeekStartDate, getTodayDayOfWeek } from '../../../shared/utils/dates';

interface TasksUIState {
  weekStartDate: string;
  selectedDay: DayOfWeek;
  isAddModalVisible: boolean;
  editingTaskId: string | null;
}

interface TasksUIActions {
  setWeekStartDate: (date: string) => void;
  setSelectedDay: (day: DayOfWeek) => void;
  goToToday: () => void;
  showAddModal: () => void;
  hideAddModal: () => void;
  setEditingTask: (taskId: string | null) => void;
}

type TasksStore = TasksUIState & TasksUIActions;

export const useTasksStore = create<TasksStore>((set) => ({
  // State
  weekStartDate: getWeekStartDate(),
  selectedDay: getTodayDayOfWeek(),
  isAddModalVisible: false,
  editingTaskId: null,

  // Actions
  setWeekStartDate: (date) => set({ weekStartDate: date }),
  setSelectedDay: (day) => set({ selectedDay: day }),
  goToToday: () =>
    set({
      weekStartDate: getWeekStartDate(),
      selectedDay: getTodayDayOfWeek(),
    }),
  showAddModal: () => set({ isAddModalVisible: true }),
  hideAddModal: () => set({ isAddModalVisible: false, editingTaskId: null }),
  setEditingTask: (taskId) =>
    set({ editingTaskId: taskId, isAddModalVisible: taskId !== null }),
}));
