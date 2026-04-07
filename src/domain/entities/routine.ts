import type { DayOfWeek } from './task';

export interface Routine {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineItem {
  id: string;
  routineId: string;
  title: string;
  description: string | null;
  dayOfWeek: DayOfWeek;
  scheduledTime: string | null;
  createdAt: string;
}

export interface RoutineWithItems extends Routine {
  items: RoutineItem[];
}

export interface RoutineItemInsert {
  title: string;
  description?: string | null;
  dayOfWeek: DayOfWeek;
  scheduledTime?: string | null;
}

export interface RoutineInsert {
  name: string;
  items: RoutineItemInsert[];
}
