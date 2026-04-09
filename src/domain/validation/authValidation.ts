export interface PasswordRequirement {
  key: string;
  label: string;
  met: boolean;
}

export interface PasswordValidationErrors {
  minLength?: string;
  uppercase?: string;
  number?: string;
  symbol?: string;
}

const SYMBOL_REGEX = /[!@#$%^&*()\-+=[\]{}|;:'",.<>?/`~]/;

export function validatePassword(password: string): PasswordValidationErrors {
  const errors: PasswordValidationErrors = {};

  if (password.length < 8) {
    errors.minLength = 'Mínimo 8 caracteres';
  }
  if (!/[A-Z]/.test(password)) {
    errors.uppercase = 'Al menos una letra mayúscula';
  }
  if (!/\d/.test(password)) {
    errors.number = 'Al menos un número';
  }
  if (!SYMBOL_REGEX.test(password)) {
    errors.symbol = 'Al menos un símbolo (!@#$%^&*...)';
  }

  return errors;
}

export function isPasswordValid(password: string): boolean {
  return Object.keys(validatePassword(password)).length === 0;
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  const errors = validatePassword(password);
  return [
    { key: 'minLength', label: 'Mínimo 8 caracteres', met: !errors.minLength },
    { key: 'uppercase', label: 'Una letra mayúscula', met: !errors.uppercase },
    { key: 'number', label: 'Un número', met: !errors.number },
    { key: 'symbol', label: 'Un símbolo (!@#$%^&*...)', met: !errors.symbol },
  ];
}
