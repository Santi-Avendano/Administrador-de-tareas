export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dayOfWeek: DayOfWeek;
  weekStartDate: string; // 'YYYY-MM-DD'
  isCompleted: boolean;
  completedAt: string | null;
  position: number;
  scheduledTime: string | null; // 'HH:mm' or null
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  routineId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInsert {
  title: string;
  description?: string | null;
  dayOfWeek: DayOfWeek;
  weekStartDate: string;
  scheduledTime?: string | null;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
  routineId?: string | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  isCompleted?: boolean;
  position?: number;
  scheduledTime?: string | null;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
}
