import { create } from 'zustand';

interface RoutinesUIState {
  isFormModalVisible: boolean;
  editingRoutineId: string | null;
}

interface RoutinesUIActions {
  showFormModal: () => void;
  hideFormModal: () => void;
  setEditingRoutine: (id: string | null) => void;
}

type RoutinesStore = RoutinesUIState & RoutinesUIActions;

export const useRoutinesStore = create<RoutinesStore>((set) => ({
  isFormModalVisible: false,
  editingRoutineId: null,

  showFormModal: () => set({ isFormModalVisible: true }),
  hideFormModal: () => set({ isFormModalVisible: false, editingRoutineId: null }),
  setEditingRoutine: (id) =>
    set({ editingRoutineId: id, isFormModalVisible: id !== null }),
}));
