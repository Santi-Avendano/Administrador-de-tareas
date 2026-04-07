import * as Notifications from 'expo-notifications';
import { subMinutes, isBefore } from 'date-fns';
import type { INotificationService, TaskReminderData } from '../../domain/services/INotificationService';
import { getDayDate } from '../../shared/utils/dates';
import type { DayOfWeek } from '../../domain/entities/task';

export class ExpoNotificationService implements INotificationService {
  async requestPermissions(): Promise<boolean> {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async scheduleTaskReminder(task: TaskReminderData): Promise<string | null> {
    const [hours, minutes] = task.scheduledTime.split(':').map(Number);
    const taskDate = getDayDate(task.weekStartDate, task.dayOfWeek as DayOfWeek);
    taskDate.setHours(hours, minutes, 0, 0);

    const reminderDate = subMinutes(taskDate, task.reminderMinutesBefore);

    if (isBefore(reminderDate, new Date())) return null;

    const identifier = this.getIdentifier(task.id);

    await this.cancelTaskReminder(task.id);

    const label = task.reminderMinutesBefore >= 60
      ? `${task.reminderMinutesBefore / 60} hora(s)`
      : `${task.reminderMinutesBefore} minutos`;

    return Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: 'Recordatorio',
        body: `${task.title} en ${label}`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });
  }

  async cancelTaskReminder(taskId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(this.getIdentifier(taskId));
    } catch {
      // Notification may not exist — safe to ignore
    }
  }

  private getIdentifier(taskId: string): string {
    return `task-reminder-${taskId}`;
  }
}
