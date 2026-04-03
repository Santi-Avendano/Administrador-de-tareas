import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRepository } from '../../../app/providers/RepositoryProvider';
import { taskKeys } from '../constants/queryKeys';
import type { DayOfWeek, Task } from '../../../domain/entities/task';

export function useTasks(weekStartDate: string) {
  const repository = useRepository();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: taskKeys.byWeek(weekStartDate),
    queryFn: () => repository.getByWeek(weekStartDate),
  });

  useEffect(() => {
    // Realtime: invalida el cache en vez de parchear manualmente.
    // Evita race conditions con optimistic updates en vuelo.
    const unsubscribe = repository.subscribeToWeek(weekStartDate, () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.byWeek(weekStartDate) });
    });

    return unsubscribe;
  }, [weekStartDate, repository, queryClient]);

  return query;
}

export function useTasksForDay(weekStartDate: string, dayOfWeek: DayOfWeek) {
  const { data: tasks, ...rest } = useTasks(weekStartDate);
  return {
    ...rest,
    data: tasks?.filter((t) => t.dayOfWeek === dayOfWeek) ?? [],
  };
}

export function useTaskById(weekStartDate: string, taskId: string): Task | undefined {
  const { data: tasks } = useTasks(weekStartDate);
  return tasks?.find((t) => t.id === taskId);
}

export function useTaskCountsByDay(weekStartDate: string) {
  const { data: tasks } = useTasks(weekStartDate);

  const counts: Record<DayOfWeek, { total: number; completed: number }> = {
    0: { total: 0, completed: 0 },
    1: { total: 0, completed: 0 },
    2: { total: 0, completed: 0 },
    3: { total: 0, completed: 0 },
    4: { total: 0, completed: 0 },
    5: { total: 0, completed: 0 },
    6: { total: 0, completed: 0 },
  };

  tasks?.forEach((task) => {
    counts[task.dayOfWeek].total++;
    if (task.isCompleted) counts[task.dayOfWeek].completed++;
  });

  return counts;
}
