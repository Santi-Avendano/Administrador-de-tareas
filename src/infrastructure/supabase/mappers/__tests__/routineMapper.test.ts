import { routineMapper, type RoutineRow, type RoutineItemRow } from '../routineMapper';

const sampleRow: RoutineRow = {
  id: 'routine-1',
  user_id: 'user-1',
  name: 'Entrenamiento',
  is_active: true,
  created_at: '2026-04-06T10:00:00Z',
  updated_at: '2026-04-06T10:00:00Z',
};

const sampleItemRow: RoutineItemRow = {
  id: 'item-1',
  routine_id: 'routine-1',
  title: 'Correr',
  description: null,
  day_of_week: 0,
  scheduled_time: '07:00',
  created_at: '2026-04-06T10:00:00Z',
};

describe('routineMapper.toDomain', () => {
  it('maps all fields from snake_case to camelCase', () => {
    const routine = routineMapper.toDomain(sampleRow);
    expect(routine.id).toBe('routine-1');
    expect(routine.userId).toBe('user-1');
    expect(routine.name).toBe('Entrenamiento');
    expect(routine.isActive).toBe(true);
  });
});

describe('routineMapper.itemToDomain', () => {
  it('maps item fields correctly', () => {
    const item = routineMapper.itemToDomain(sampleItemRow);
    expect(item.id).toBe('item-1');
    expect(item.routineId).toBe('routine-1');
    expect(item.title).toBe('Correr');
    expect(item.dayOfWeek).toBe(0);
    expect(item.scheduledTime).toBe('07:00');
    expect(item.description).toBeNull();
  });
});

describe('routineMapper.toInsertRow', () => {
  it('maps name and userId', () => {
    const row = routineMapper.toInsertRow('Mi rutina', 'user-2');
    expect(row.user_id).toBe('user-2');
    expect(row.name).toBe('Mi rutina');
  });
});

describe('routineMapper.itemToInsertRow', () => {
  it('maps item insert fields to snake_case', () => {
    const row = routineMapper.itemToInsertRow(
      { title: 'Gym', dayOfWeek: 2, scheduledTime: '18:00' },
      'routine-2'
    );
    expect(row.routine_id).toBe('routine-2');
    expect(row.title).toBe('Gym');
    expect(row.day_of_week).toBe(2);
    expect(row.scheduled_time).toBe('18:00');
  });

  it('defaults description and scheduledTime to null', () => {
    const row = routineMapper.itemToInsertRow(
      { title: 'Tarea', dayOfWeek: 4 },
      'routine-2'
    );
    expect(row.description).toBeNull();
    expect(row.scheduled_time).toBeNull();
  });
});
