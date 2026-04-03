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
  createdAt: string;
  updatedAt: string;
}

export interface TaskInsert {
  title: string;
  description?: string | null;
  dayOfWeek: DayOfWeek;
  weekStartDate: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  isCompleted?: boolean;
  position?: number;
}
