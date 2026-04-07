import type { Routine, RoutineWithItems, RoutineInsert } from '../entities/routine';

export interface IRoutineRepository {
  getAll(): Promise<RoutineWithItems[]>;
  getById(id: string): Promise<RoutineWithItems>;
  create(routine: RoutineInsert): Promise<RoutineWithItems>;
  update(id: string, name: string, isActive: boolean): Promise<Routine>;
  delete(id: string): Promise<void>;
  deleteFutureTasks(routineId: string, fromDate: string): Promise<void>;
  generateTasks(routineId: string, fromDate: string, toDate: string): Promise<void>;
}
