export interface TaskReminderData {
  id: string;
  title: string;
  scheduledTime: string;
  dayOfWeek: number;
  weekStartDate: string;
  reminderMinutesBefore: number;
}

export interface INotificationService {
  requestPermissions(): Promise<boolean>;
  scheduleTaskReminder(task: TaskReminderData): Promise<string | null>;
  cancelTaskReminder(taskId: string): Promise<void>;
}
