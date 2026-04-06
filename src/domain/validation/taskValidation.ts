export interface TaskValidationErrors {
  title?: string;
}

export function validateTask(title: string): TaskValidationErrors {
  const errors: TaskValidationErrors = {};
  if (!title.trim()) {
    errors.title = 'El título es obligatorio';
  }
  return errors;
}

export function isTaskValid(title: string): boolean {
  return Object.keys(validateTask(title)).length === 0;
}

export function isValidTime(hours: number, minutes: number): boolean {
  return Number.isInteger(hours) && Number.isInteger(minutes) &&
    hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
