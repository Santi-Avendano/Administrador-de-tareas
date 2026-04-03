import { useMutation, useQueryClient } from '@tanstack/react-query';
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

      const optimisticTask: Task = {
        id: crypto.randomUUID(),
        userId: '',
        title: newTask.title,
        description: newTask.description ?? null,
        dayOfWeek: newTask.dayOfWeek,
        weekStartDate: newTask.weekStartDate,
        isCompleted: false,
        completedAt: null,
        position: (previousTasks ?? []).filter(
          (t) => t.dayOfWeek === newTask.dayOfWeek
        ).length,
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
