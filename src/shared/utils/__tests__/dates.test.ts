import {
  getWeekStartDate,
  getWeekEndDate,
  getPreviousWeekStart,
  getNextWeekStart,
  formatWeekRange,
  getDayDate,
  getDayName,
  formatDayDate,
  getMaxFutureWeekStart,
  getMinPastWeekStart,
} from '../dates';

describe('getWeekStartDate', () => {
  it('returns Monday for a Wednesday', () => {
    const wed = new Date(2026, 3, 8); // Wed Apr 8, 2026
    expect(getWeekStartDate(wed)).toBe('2026-04-06');
  });

  it('returns same day for a Monday', () => {
    const mon = new Date(2026, 3, 6); // Mon Apr 6, 2026
    expect(getWeekStartDate(mon)).toBe('2026-04-06');
  });

  it('returns previous Monday for a Sunday', () => {
    const sun = new Date(2026, 3, 12); // Sun Apr 12, 2026
    expect(getWeekStartDate(sun)).toBe('2026-04-06');
  });
});

describe('getWeekEndDate', () => {
  it('returns Sunday for a Wednesday', () => {
    const wed = new Date(2026, 3, 8);
    expect(getWeekEndDate(wed)).toBe('2026-04-12');
  });
});

describe('getPreviousWeekStart', () => {
  it('goes back one week', () => {
    expect(getPreviousWeekStart('2026-04-06')).toBe('2026-03-30');
  });
});

describe('getNextWeekStart', () => {
  it('goes forward one week', () => {
    expect(getNextWeekStart('2026-04-06')).toBe('2026-04-13');
  });
});

describe('formatWeekRange', () => {
  it('formats same-month range in Spanish', () => {
    expect(formatWeekRange('2026-04-06')).toBe('abr 6-12');
  });

  it('formats cross-month range in Spanish', () => {
    expect(formatWeekRange('2026-03-30')).toBe('mar 30 - abr 5');
  });
});

describe('getDayDate', () => {
  it('returns correct date for Monday (dayOfWeek 0)', () => {
    const date = getDayDate('2026-04-06', 0);
    expect(date.getDate()).toBe(6);
  });

  it('returns correct date for Sunday (dayOfWeek 6)', () => {
    const date = getDayDate('2026-04-06', 6);
    expect(date.getDate()).toBe(12);
  });

  it('returns correct date for Wednesday (dayOfWeek 2)', () => {
    const date = getDayDate('2026-04-06', 2);
    expect(date.getDate()).toBe(8);
  });
});

describe('getDayName', () => {
  it('returns short names in Spanish by default', () => {
    expect(getDayName(0)).toBe('Lun');
    expect(getDayName(4)).toBe('Vie');
    expect(getDayName(6)).toBe('Dom');
  });

  it('returns full names in Spanish when short=false', () => {
    expect(getDayName(0, false)).toBe('Lunes');
    expect(getDayName(6, false)).toBe('Domingo');
  });
});

describe('formatDayDate', () => {
  it('returns day number as string', () => {
    expect(formatDayDate('2026-04-06', 0)).toBe('6');
    expect(formatDayDate('2026-04-06', 6)).toBe('12');
  });
});

describe('getMaxFutureWeekStart', () => {
  it('returns a Monday date string 2 months in the future', () => {
    const result = getMaxFutureWeekStart();
    // Should be a valid YYYY-MM-DD string
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Should be in the future
    const today = new Date();
    const maxDate = new Date(result);
    expect(maxDate.getTime()).toBeGreaterThan(today.getTime());
    // Should be a Monday (1 in JS getDay())
    expect(maxDate.getDay()).toBe(1);
  });
});

describe('getMinPastWeekStart', () => {
  it('returns a valid YYYY-MM-DD string', () => {
    expect(getMinPastWeekStart()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns a Monday (getDay() === 1)', () => {
    const minDate = new Date(getMinPastWeekStart());
    expect(minDate.getDay()).toBe(1);
  });

  it('returns a date in the past', () => {
    const today = new Date();
    const minDate = new Date(getMinPastWeekStart());
    expect(minDate.getTime()).toBeLessThan(today.getTime());
  });
});
