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
