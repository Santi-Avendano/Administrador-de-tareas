import { taskMapper, type TaskRow } from '../taskMapper';

const sampleRow: TaskRow = {
  id: 'abc-123',
  user_id: 'user-456',
  title: 'Test task',
  description: 'A description',
  day_of_week: 2,
  week_start_date: '2026-04-06',
  is_completed: false,
  completed_at: null,
  position: 3,
  scheduled_time: '09:30',
  routine_id: null,
  created_at: '2026-04-06T10:00:00Z',
  updated_at: '2026-04-06T10:00:00Z',
};

describe('taskMapper.toDomain', () => {
  it('maps all fields from snake_case to camelCase', () => {
    const task = taskMapper.toDomain(sampleRow);

    expect(task.id).toBe('abc-123');
    expect(task.userId).toBe('user-456');
    expect(task.title).toBe('Test task');
    expect(task.description).toBe('A description');
    expect(task.dayOfWeek).toBe(2);
    expect(task.weekStartDate).toBe('2026-04-06');
    expect(task.isCompleted).toBe(false);
    expect(task.completedAt).toBeNull();
    expect(task.position).toBe(3);
    expect(task.scheduledTime).toBe('09:30');
    expect(task.routineId).toBeNull();
    expect(task.createdAt).toBe('2026-04-06T10:00:00Z');
    expect(task.updatedAt).toBe('2026-04-06T10:00:00Z');
  });

  it('maps null scheduledTime correctly', () => {
    const row = { ...sampleRow, scheduled_time: null };
    const task = taskMapper.toDomain(row);
    expect(task.scheduledTime).toBeNull();
  });
});

describe('taskMapper.toInsertRow', () => {
  it('maps insert fields to snake_case', () => {
    const row = taskMapper.toInsertRow(
      {
        title: 'New task',
        description: 'Desc',
        dayOfWeek: 0,
        weekStartDate: '2026-04-06',
        scheduledTime: '14:00',
      },
      'user-789'
    );

    expect(row.user_id).toBe('user-789');
    expect(row.title).toBe('New task');
    expect(row.description).toBe('Desc');
    expect(row.day_of_week).toBe(0);
    expect(row.week_start_date).toBe('2026-04-06');
    expect(row.scheduled_time).toBe('14:00');
    expect(row.routine_id).toBeNull();
  });

  it('defaults description, scheduledTime and routineId to null', () => {
    const row = taskMapper.toInsertRow(
      {
        title: 'Minimal',
        dayOfWeek: 1,
        weekStartDate: '2026-04-06',
      },
      'user-789'
    );

    expect(row.description).toBeNull();
    expect(row.scheduled_time).toBeNull();
    expect(row.routine_id).toBeNull();
  });

  it('maps routineId to routine_id', () => {
    const row = taskMapper.toInsertRow(
      {
        title: 'Routine task',
        dayOfWeek: 0,
        weekStartDate: '2026-04-06',
        routineId: 'routine-123',
      },
      'user-789'
    );
    expect(row.routine_id).toBe('routine-123');
  });
});

describe('taskMapper.toUpdateRow', () => {
  it('maps only provided fields', () => {
    const row = taskMapper.toUpdateRow({ title: 'Updated' });
    expect(row.title).toBe('Updated');
    expect(row.is_completed).toBeUndefined();
    expect(row.scheduled_time).toBeUndefined();
  });

  it('maps scheduledTime to scheduled_time', () => {
    const row = taskMapper.toUpdateRow({ scheduledTime: '10:00' });
    expect(row.scheduled_time).toBe('10:00');
  });

  it('maps null scheduledTime', () => {
    const row = taskMapper.toUpdateRow({ scheduledTime: null });
    expect(row.scheduled_time).toBeNull();
  });

  it('sets completed_at when marking as completed', () => {
    const row = taskMapper.toUpdateRow({ isCompleted: true });
    expect(row.is_completed).toBe(true);
    expect(row.completed_at).toBeDefined();
    expect(typeof row.completed_at).toBe('string');
  });

  it('clears completed_at when marking as incomplete', () => {
    const row = taskMapper.toUpdateRow({ isCompleted: false });
    expect(row.is_completed).toBe(false);
    expect(row.completed_at).toBeNull();
  });

  it('maps position', () => {
    const row = taskMapper.toUpdateRow({ position: 5 });
    expect(row.position).toBe(5);
  });
});
