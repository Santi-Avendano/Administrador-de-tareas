import { useMutation, useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { useRepository } from '../../../app/providers/RepositoryProvider';
import { taskKeys } from '../constants/queryKeys';
import type { Task, TaskInsert, TaskUpdate } from '../../../domain/entities/task';

export function useCreateTask(weekStartDate: string) {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const queryKey = taskKeys.byWeek(weekStartDate);

  return useMutation({
    mutationFn: (task: TaskInsert) => repository.create(task),
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

      const dayTasks = (previousTasks ?? [])
        .filter((t) => t.dayOfWeek === newTask.dayOfWeek && !t.isCompleted)
        .sort((a, b) => a.position - b.position);

      let position: number;
      if (newTask.scheduledTime) {
        const insertIndex = dayTasks.findIndex(
          (t) => t.scheduledTime && t.scheduledTime > newTask.scheduledTime!
        );
        if (insertIndex === -1) {
          const lastTimedIndex = dayTasks.findLastIndex((t) => t.scheduledTime);
          position = lastTimedIndex === -1 ? 0 : lastTimedIndex + 1;
        } else {
          position = insertIndex;
        }
      } else {
        position = dayTasks.length;
      }

      const optimisticTask: Task = {
        id: randomUUID(),
        userId: '',
        title: newTask.title,
        description: newTask.description ?? null,
        dayOfWeek: newTask.dayOfWeek,
        weekStartDate: newTask.weekStartDate,
        isCompleted: false,
        completedAt: null,
        position,
        scheduledTime: newTask.scheduledTime ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Task[]>(queryKey, (old) =>
        old ? [...old, optimisticTask] : [optimisticTask]
      );

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useUpdateTask(weekStartDate: string) {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const queryKey = taskKeys.byWeek(weekStartDate);

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TaskUpdate }) =>
      repository.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

      queryClient.setQueryData<Task[]>(queryKey, (old) =>
        old?.map((task) =>
          task.id === id
            ? {
                ...task,
                ...updates,
                scheduledTime:
                  updates.scheduledTime !== undefined
                    ? updates.scheduledTime
                    : task.scheduledTime,
                completedAt:
                  updates.isCompleted === true
                    ? new Date().toISOString()
                    : updates.isCompleted === false
                    ? null
                    : task.completedAt,
              }
            : task
        )
      );

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useDeleteTask(weekStartDate: string) {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const queryKey = taskKeys.byWeek(weekStartDate);

  return useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(queryKey, (old) =>
        old?.filter((task) => task.id !== id)
      );
      return { previousTasks };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useToggleTaskCompletion(weekStartDate: string) {
  const updateTask = useUpdateTask(weekStartDate);

  return (task: Task) => {
    updateTask.mutate({
      id: task.id,
      updates: { isCompleted: !task.isCompleted },
    });
  };
}

export function useReorderTasks(weekStartDate: string) {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const queryKey = taskKeys.byWeek(weekStartDate);

  return useMutation({
    mutationFn: (updates: { id: string; position: number }[]) =>
      repository.reorderTasks(updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

      const positionMap = new Map(updates.map((u) => [u.id, u.position]));
      queryClient.setQueryData<Task[]>(queryKey, (old) =>
        old?.map((task) => {
          const newPos = positionMap.get(task.id);
          return newPos !== undefined ? { ...task, position: newPos } : task;
        })
      );

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
