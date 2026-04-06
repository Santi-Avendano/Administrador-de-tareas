import {
  getWeekStartDate,
  getWeekEndDate,
  getPreviousWeekStart,
  getNextWeekStart,
  formatWeekRange,
  getDayDate,
  getDayName,
  formatDayDate,
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
  it('formats same-month range', () => {
    expect(formatWeekRange('2026-04-06')).toBe('Apr 6-12');
  });

  it('formats cross-month range', () => {
    expect(formatWeekRange('2026-03-30')).toBe('Mar 30 - Apr 5');
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
  it('returns short names by default', () => {
    expect(getDayName(0)).toBe('Mon');
    expect(getDayName(4)).toBe('Fri');
    expect(getDayName(6)).toBe('Sun');
  });

  it('returns full names when short=false', () => {
    expect(getDayName(0, false)).toBe('Monday');
    expect(getDayName(6, false)).toBe('Sunday');
  });
});

describe('formatDayDate', () => {
  it('returns day number as string', () => {
    expect(formatDayDate('2026-04-06', 0)).toBe('6');
    expect(formatDayDate('2026-04-06', 6)).toBe('12');
  });
});
