import { validateRoutine, isRoutineValid } from '../routineValidation';
import type { RoutineItemInsert } from '../../entities/routine';

const validItem: RoutineItemInsert = {
  title: 'Correr',
  dayOfWeek: 0,
  scheduledTime: '07:00',
};

describe('validateRoutine', () => {
  it('returns error when name is empty', () => {
    const errors = validateRoutine('', [validItem]);
    expect(errors.name).toBe('El nombre es obligatorio');
  });

  it('returns error when name is only whitespace', () => {
    const errors = validateRoutine('   ', [validItem]);
    expect(errors.name).toBeDefined();
  });

  it('returns error when items array is empty', () => {
    const errors = validateRoutine('Rutina', []);
    expect(errors.items).toBe('Agregá al menos una tarea');
  });

  it('returns error when an item has empty title', () => {
    const errors = validateRoutine('Rutina', [{ ...validItem, title: '' }]);
    expect(errors.items).toBe('Todas las tareas deben tener título');
  });

  it('returns no errors for valid routine', () => {
    const errors = validateRoutine('Rutina', [validItem]);
    expect(errors).toEqual({});
  });

  it('accepts items without scheduled time', () => {
    const item: RoutineItemInsert = { title: 'Tarea', dayOfWeek: 2 };
    const errors = validateRoutine('Rutina', [item]);
    expect(errors).toEqual({});
  });
});

describe('isRoutineValid', () => {
  it('returns false for invalid routine', () => {
    expect(isRoutineValid('', [])).toBe(false);
  });

  it('returns true for valid routine', () => {
    expect(isRoutineValid('Rutina', [validItem])).toBe(true);
  });
});
