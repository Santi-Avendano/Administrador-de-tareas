import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoutineRepository } from '../../../app/providers/RepositoryProvider';
import { routineKeys } from '../constants/queryKeys';
import { taskKeys } from '../../tasks/constants/queryKeys';
import { getWeekStartDate, getMaxFutureWeekStart } from '../../../shared/utils/dates';
import type { RoutineInsert } from '../types';

export function useCreateRoutine() {
  const repository = useRoutineRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routine: RoutineInsert) => {
      const created = await repository.create(routine);

      const fromDate = getWeekStartDate();
      const toDate = getMaxFutureWeekStart();
      await repository.generateTasks(created.id, fromDate, toDate);

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useUpdateRoutine() {
  const repository = useRoutineRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name, isActive }: { id: string; name: string; isActive: boolean }) =>
      repository.update(id, name, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.all });
    },
  });
}

export function useDeleteRoutine() {
  const repository = useRoutineRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const fromDate = getWeekStartDate();
      await repository.deleteFutureTasks(id, fromDate);
      await repository.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useToggleRoutineActive() {
  const updateRoutine = useUpdateRoutine();

  return (routine: { id: string; name: string; isActive: boolean }) => {
    updateRoutine.mutate({
      id: routine.id,
      name: routine.name,
      isActive: !routine.isActive,
    });
  };
}
