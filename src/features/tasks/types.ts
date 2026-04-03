// Re-exports desde la capa de dominio.
// Los componentes y hooks existentes que importan desde '../types' siguen funcionando.
// Para código nuevo, importar directamente desde 'domain/entities/task'.
export type { Task, TaskInsert, TaskUpdate, DayOfWeek } from '../../domain/entities/task';
