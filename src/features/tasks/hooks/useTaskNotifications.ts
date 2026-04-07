import { useCallback } from 'react';
import { useNotificationService } from '../../../app/providers/RepositoryProvider';
import type { Task } from '../../../domain/entities/task';

export function useTaskNotifications() {
  const notificationService = useNotificationService();

  const syncReminder = useCallback(async (task: Task) => {
    if (task.reminderEnabled && task.scheduledTime && !task.isCompleted) {
      const granted = await notificationService.requestPermissions();
      if (!granted) return;

      await notificationService.scheduleTaskReminder({
        id: task.id,
        title: task.title,
        scheduledTime: task.scheduledTime,
        dayOfWeek: task.dayOfWeek,
        weekStartDate: task.weekStartDate,
        reminderMinutesBefore: task.reminderMinutesBefore,
      });
    } else {
      await notificationService.cancelTaskReminder(task.id);
    }
  }, [notificationService]);

  const cancelReminder = useCallback(async (taskId: string) => {
    await notificationService.cancelTaskReminder(taskId);
  }, [notificationService]);

  return { syncReminder, cancelReminder };
}
