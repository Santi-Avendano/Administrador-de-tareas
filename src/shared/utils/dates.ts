import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  parseISO,
  isSameDay,
  addDays,
} from 'date-fns';
import type { DayOfWeek } from '../../features/tasks/types';

const WEEK_OPTIONS = { weekStartsOn: 1 as const }; // Monday

export function getWeekStartDate(date: Date = new Date()): string {
  return format(startOfWeek(date, WEEK_OPTIONS), 'yyyy-MM-dd');
}

export function getWeekEndDate(date: Date = new Date()): string {
  return format(endOfWeek(date, WEEK_OPTIONS), 'yyyy-MM-dd');
}

export function getPreviousWeekStart(weekStartDate: string): string {
  const date = parseISO(weekStartDate);
  return format(subWeeks(date, 1), 'yyyy-MM-dd');
}

export function getNextWeekStart(weekStartDate: string): string {
  const date = parseISO(weekStartDate);
  return format(addWeeks(date, 1), 'yyyy-MM-dd');
}

export function formatWeekRange(weekStartDate: string): string {
  const start = parseISO(weekStartDate);
  const end = endOfWeek(start, WEEK_OPTIONS);

  const startMonth = format(start, 'MMM');
  const endMonth = format(end, 'MMM');

  if (startMonth === endMonth) {
    return `${startMonth} ${format(start, 'd')}-${format(end, 'd')}`;
  }
  return `${startMonth} ${format(start, 'd')} - ${endMonth} ${format(end, 'd')}`;
}

export function getDayDate(weekStartDate: string, dayOfWeek: DayOfWeek): Date {
  const start = parseISO(weekStartDate);
  // Adjust for Monday start (our dayOfWeek 0 = Monday)
  return addDays(start, dayOfWeek);
}

export function isToday(weekStartDate: string, dayOfWeek: DayOfWeek): boolean {
  const dayDate = getDayDate(weekStartDate, dayOfWeek);
  return isSameDay(dayDate, new Date());
}

export function getTodayDayOfWeek(): DayOfWeek {
  const today = new Date();
  const weekStart = startOfWeek(today, WEEK_OPTIONS);
  const diff = Math.floor((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(6, Math.max(0, diff)) as DayOfWeek;
}

export function getDayName(dayOfWeek: DayOfWeek, short = true): string {
  const days = short
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayOfWeek];
}

export function formatDayDate(weekStartDate: string, dayOfWeek: DayOfWeek): string {
  const date = getDayDate(weekStartDate, dayOfWeek);
  return format(date, 'd');
}
