import type { DayOfWeek, Task, TaskInsert, TaskUpdate } from '../../../domain/entities/task';

/** Representa una fila de la tabla `tasks` en Supabase (snake_case). */
export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  day_of_week: number;
  week_start_date: string;
  is_completed: boolean;
  completed_at: string | null;
  position: number;
  scheduled_time: string | null;
  created_at: string;
  updated_at: string;
}

export const taskMapper = {
  /** TaskRow (DB) → Task (dominio) */
  toDomain(row: TaskRow): Task {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      dayOfWeek: row.day_of_week as DayOfWeek,
      weekStartDate: row.week_start_date,
      isCompleted: row.is_completed,
      completedAt: row.completed_at,
      position: row.position,
      scheduledTime: row.scheduled_time,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  /** TaskInsert (dominio) → fila de inserción para Supabase */
  toInsertRow(
    task: TaskInsert,
    userId: string
  ): Pick<TaskRow, 'user_id' | 'title' | 'description' | 'day_of_week' | 'week_start_date' | 'scheduled_time'> {
    return {
      user_id: userId,
      title: task.title,
      description: task.description ?? null,
      day_of_week: task.dayOfWeek,
      week_start_date: task.weekStartDate,
      scheduled_time: task.scheduledTime ?? null,
    };
  },

  /** TaskUpdate (dominio) → campos parciales para Supabase */
  toUpdateRow(data: TaskUpdate): Partial<TaskRow> {
    const row: Partial<TaskRow> = {};

    if (data.title !== undefined) row.title = data.title;
    if (data.description !== undefined) row.description = data.description;
    if (data.position !== undefined) row.position = data.position;
    if (data.scheduledTime !== undefined) row.scheduled_time = data.scheduledTime;
    if (data.isCompleted !== undefined) {
      row.is_completed = data.isCompleted;
      row.completed_at = data.isCompleted ? new Date().toISOString() : null;
    }

    return row;
  },
};
