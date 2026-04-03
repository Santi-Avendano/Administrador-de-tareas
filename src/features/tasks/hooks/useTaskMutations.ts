import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRepository } from '../../../app/providers/RepositoryProvider';
import { taskKeys } from '../constants/queryKeys';
import type { Task, TaskInsert, TaskUpdate } from '../../../domain/entities/task';

export function useCreateTask() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: TaskInsert) => repository.create(task),
    onSuccess: (newTask) => {
      queryClient.setQueryData<Task[]>(
        taskKeys.byWeek(newTask.weekStartDate),
        (old) => (old ? [...old, newTask] : [newTask])
      );
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
