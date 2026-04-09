import type { Task, TaskInsert, TaskUpdate } from '../entities/task';

export interface ITaskRepository {
  getByWeek(weekStartDate: string): Promise<Task[]>;
  create(task: TaskInsert): Promise<Task>;
  update(id: string, data: TaskUpdate): Promise<Task>;
  delete(id: string): Promise<void>;
  /**
   * Suscribe a cambios en tiempo real de la semana indicada.
   * Retorna una función de cleanup (unsubscribe).
   */
  subscribeToWeek(weekStartDate: string, onUpdate: () => void): () => void;
  reorderTasks(updates: { id: string; position: number }[]): Promise<void>;
  deleteTasksBefore(weekStartDate: string): Promise<void>;
}
