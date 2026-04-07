import type { SupabaseClient } from '@supabase/supabase-js';
import { addWeeks, parseISO, isBefore } from 'date-fns';
import type { IRoutineRepository } from '../../../domain/repositories/IRoutineRepository';
import type {
  Routine,
  RoutineWithItems,
  RoutineInsert,
} from '../../../domain/entities/routine';
import type { DayOfWeek } from '../../../domain/entities/task';
import { routineMapper, type RoutineRow, type RoutineItemRow } from '../mappers/routineMapper';
import { getWeekStartDate } from '../../../shared/utils/dates';

export class SupabaseRoutineRepository implements IRoutineRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getAll(): Promise<RoutineWithItems[]> {
    const { data: userData } = await this.client.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data: routines, error: rErr } = await this.client
      .from('routines')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (rErr) throw rErr;

    const routineIds = (routines as RoutineRow[]).map((r) => r.id);
    if (routineIds.length === 0) return [];

    const { data: items, error: iErr } = await this.client
      .from('routine_items')
      .select('*')
      .in('routine_id', routineIds)
      .order('day_of_week', { ascending: true });

    if (iErr) throw iErr;

    const itemsByRoutine = new Map<string, RoutineItemRow[]>();
    for (const item of items as RoutineItemRow[]) {
      const list = itemsByRoutine.get(item.routine_id) ?? [];
      list.push(item);
      itemsByRoutine.set(item.routine_id, list);
    }

    return (routines as RoutineRow[]).map((r) => ({
      ...routineMapper.toDomain(r),
      items: (itemsByRoutine.get(r.id) ?? []).map(routineMapper.itemToDomain),
    }));
  }

  async getById(id: string): Promise<RoutineWithItems> {
    const { data: routine, error: rErr } = await this.client
      .from('routines')
      .select('*')
      .eq('id', id)
      .single();

    if (rErr) throw rErr;

    const { data: items, error: iErr } = await this.client
      .from('routine_items')
      .select('*')
      .eq('routine_id', id)
      .order('day_of_week', { ascending: true });

    if (iErr) throw iErr;

    return {
      ...routineMapper.toDomain(routine as RoutineRow),
      items: (items as RoutineItemRow[]).map(routineMapper.itemToDomain),
    };
  }

  async create(routine: RoutineInsert): Promise<RoutineWithItems> {
    const { data: userData } = await this.client.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data: created, error: rErr } = await this.client
      .from('routines')
      .insert(routineMapper.toInsertRow(routine.name, userData.user.id))
      .select()
      .single();

    if (rErr) throw rErr;

    const routineRow = created as RoutineRow;

    const itemRows = routine.items.map((item) =>
      routineMapper.itemToInsertRow(item, routineRow.id)
    );

    const { data: createdItems, error: iErr } = await this.client
      .from('routine_items')
      .insert(itemRows)
      .select();

    if (iErr) throw iErr;

    return {
      ...routineMapper.toDomain(routineRow),
      items: (createdItems as RoutineItemRow[]).map(routineMapper.itemToDomain),
    };
  }

  async update(id: string, name: string, isActive: boolean): Promise<Routine> {
    const { data, error } = await this.client
      .from('routines')
      .update({ name, is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return routineMapper.toDomain(data as RoutineRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from('routines').delete().eq('id', id);
    if (error) throw error;
  }

  async deleteFutureTasks(routineId: string, fromDate: string): Promise<void> {
    const { error } = await this.client
      .from('tasks')
      .delete()
      .eq('routine_id', routineId)
      .eq('is_completed', false)
      .gte('week_start_date', fromDate);

    if (error) throw error;
  }

  async generateTasks(
    routineId: string,
    fromDate: string,
    toDate: string
  ): Promise<void> {
    const { data: userData } = await this.client.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const routine = await this.getById(routineId);
    if (routine.items.length === 0) return;

    // Calculate all week starts between fromDate and toDate
    const weeks: string[] = [];
    let current = parseISO(fromDate);
    const end = parseISO(toDate);

    while (isBefore(current, end) || getWeekStartDate(current) === getWeekStartDate(end)) {
      weeks.push(getWeekStartDate(current));
      current = addWeeks(current, 1);
      // Safety: prevent infinite loop
      if (weeks.length > 20) break;
    }

    // Check which tasks already exist for this routine in the date range
    const { data: existingTasks, error: checkErr } = await this.client
      .from('tasks')
      .select('week_start_date, day_of_week, title')
      .eq('routine_id', routineId)
      .gte('week_start_date', fromDate)
      .lte('week_start_date', toDate);

    if (checkErr) throw checkErr;

    const existingSet = new Set(
      (existingTasks ?? []).map(
        (t: { week_start_date: string; day_of_week: number; title: string }) =>
          `${t.week_start_date}|${t.day_of_week}|${t.title}`
      )
    );

    // Build batch of tasks to insert
    const tasksToInsert: Array<{
      user_id: string;
      title: string;
      description: string | null;
      day_of_week: number;
      week_start_date: string;
      scheduled_time: string | null;
      routine_id: string;
    }> = [];

    for (const weekStart of weeks) {
      for (const item of routine.items) {
        const key = `${weekStart}|${item.dayOfWeek}|${item.title}`;
        if (!existingSet.has(key)) {
          tasksToInsert.push({
            user_id: userData.user.id,
            title: item.title,
            description: item.description,
            day_of_week: item.dayOfWeek,
            week_start_date: weekStart,
            scheduled_time: item.scheduledTime,
            routine_id: routineId,
          });
        }
      }
    }

    if (tasksToInsert.length === 0) return;

    // Insert in batches of 50 to avoid payload limits
    const BATCH_SIZE = 50;
    for (let i = 0; i < tasksToInsert.length; i += BATCH_SIZE) {
      const batch = tasksToInsert.slice(i, i + BATCH_SIZE);
      const { error } = await this.client.from('tasks').insert(batch);
      if (error) throw error;
    }
  }
}
