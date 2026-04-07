export const routineKeys = {
  all: ['routines'] as const,
  byId: (id: string) => ['routines', id] as const,
} as const;
