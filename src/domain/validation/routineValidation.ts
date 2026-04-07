import type { RoutineItemInsert } from '../entities/routine';

export interface RoutineValidationErrors {
  name?: string;
  items?: string;
}

export function validateRoutine(
  name: string,
  items: RoutineItemInsert[]
): RoutineValidationErrors {
  const errors: RoutineValidationErrors = {};

  if (!name.trim()) {
    errors.name = 'El nombre es obligatorio';
  }

  if (items.length === 0) {
    errors.items = 'Agregá al menos una tarea';
  } else if (items.some((item) => !item.title.trim())) {
    errors.items = 'Todas las tareas deben tener título';
  }

  return errors;
}

export function isRoutineValid(name: string, items: RoutineItemInsert[]): boolean {
  return Object.keys(validateRoutine(name, items)).length === 0;
}
