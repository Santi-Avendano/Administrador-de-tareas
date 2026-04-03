export const taskKeys = {
  all: ['tasks'] as const,
  byWeek: (weekStartDate: string) => ['tasks', weekStartDate] as const,
} as const;
