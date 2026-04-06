import type { SupabaseClient } from '@supabase/supabase-js';
import type { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import type { Task, TaskInsert, TaskUpdate } from '../../../domain/entities/task';
import { taskMapper, type TaskRow } from '../mappers/taskMapper';

export class SupabaseTaskRepository implements ITaskRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getByWeek(weekStartDate: string): Promise<Task[]> {
    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('week_start_date', weekStartDate)
      .order('position', { ascending: true });

    if (error) throw error;
    return (data as TaskRow[]).map(taskMapper.toDomain);
  }

  async create(task: TaskInsert): Promise<Task> {
    const { data: userData } = await this.client.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await this.client
      .from('tasks')
      .insert(taskMapper.toInsertRow(task, userData.user.id))
      .select()
      .single();

    if (error) throw error;
    return taskMapper.toDomain(data as TaskRow);
  }

  async update(id: string, updates: TaskUpdate): Promise<Task> {
    const { data, error } = await this.client
      .from('tasks')
      .update(taskMapper.toUpdateRow(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return taskMapper.toDomain(data as TaskRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from('tasks').delete().eq('id', id);
    if (error) throw error;
  }

  async reorderTasks(updates: { id: string; position: number }[]): Promise<void> {
    const results = await Promise.all(
      updates.map(({ id, position }) =>
        this.client
          .from('tasks')
          .update({ position })
          .eq('id', id)
      )
    );
    const error = results.find((r) => r.error)?.error;
    if (error) throw error;
  }

  subscribeToWeek(weekStartDate: string, onUpdate: () => void): () => void {
    const channelId = Math.random().toString(36).slice(2);
    const channel = this.client.channel(`tasks:${weekStartDate}:${channelId}`);

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `week_start_date=eq.${weekStartDate}`,
      },
      onUpdate
    );

    channel.subscribe();

    return () => {
      this.client.removeChannel(channel);
    };
  }
}
