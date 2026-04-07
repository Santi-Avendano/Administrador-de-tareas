import type { DayOfWeek } from '../../../domain/entities/task';
import type {
  Routine,
  RoutineItem,
  RoutineItemInsert,
} from '../../../domain/entities/routine';

export interface RoutineRow {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutineItemRow {
  id: string;
  routine_id: string;
  title: string;
  description: string | null;
  day_of_week: number;
  scheduled_time: string | null;
  created_at: string;
}

export const routineMapper = {
  toDomain(row: RoutineRow): Routine {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  itemToDomain(row: RoutineItemRow): RoutineItem {
    return {
      id: row.id,
      routineId: row.routine_id,
      title: row.title,
      description: row.description,
      dayOfWeek: row.day_of_week as DayOfWeek,
      scheduledTime: row.scheduled_time,
      createdAt: row.created_at,
    };
  },

  toInsertRow(name: string, userId: string): Pick<RoutineRow, 'user_id' | 'name'> {
    return { user_id: userId, name };
  },

  itemToInsertRow(
    item: RoutineItemInsert,
    routineId: string
  ): Pick<RoutineItemRow, 'routine_id' | 'title' | 'description' | 'day_of_week' | 'scheduled_time'> {
    return {
      routine_id: routineId,
      title: item.title,
      description: item.description ?? null,
      day_of_week: item.dayOfWeek,
      scheduled_time: item.scheduledTime ?? null,
    };
  },
};
