import { validateTask, isTaskValid, isValidTime, formatTime } from '../taskValidation';

describe('validateTask', () => {
  it('returns error when title is empty', () => {
    expect(validateTask('')).toEqual({ title: 'El título es obligatorio' });
  });

  it('returns error when title is only whitespace', () => {
    expect(validateTask('   ')).toEqual({ title: 'El título es obligatorio' });
  });

  it('returns no errors for valid title', () => {
    expect(validateTask('Mi tarea')).toEqual({});
  });
});

describe('isTaskValid', () => {
  it('returns false for empty title', () => {
    expect(isTaskValid('')).toBe(false);
  });

  it('returns true for valid title', () => {
    expect(isTaskValid('Tarea valida')).toBe(true);
  });
});

describe('isValidTime', () => {
  it('accepts valid times', () => {
    expect(isValidTime(0, 0)).toBe(true);
    expect(isValidTime(23, 59)).toBe(true);
    expect(isValidTime(12, 30)).toBe(true);
  });

  it('rejects hours out of range', () => {
    expect(isValidTime(-1, 0)).toBe(false);
    expect(isValidTime(24, 0)).toBe(false);
  });

  it('rejects minutes out of range', () => {
    expect(isValidTime(12, -1)).toBe(false);
    expect(isValidTime(12, 60)).toBe(false);
  });

  it('rejects non-integer values', () => {
    expect(isValidTime(12.5, 30)).toBe(false);
    expect(isValidTime(12, 30.5)).toBe(false);
  });
});

describe('formatTime', () => {
  it('pads single digit hours and minutes', () => {
    expect(formatTime(9, 5)).toBe('09:05');
  });

  it('does not pad double digit values', () => {
    expect(formatTime(14, 30)).toBe('14:30');
  });

  it('handles midnight', () => {
    expect(formatTime(0, 0)).toBe('00:00');
  });

  it('handles end of day', () => {
    expect(formatTime(23, 59)).toBe('23:59');
  });
});
