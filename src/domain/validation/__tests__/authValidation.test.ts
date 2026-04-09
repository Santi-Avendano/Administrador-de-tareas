import {
  validatePassword,
  isPasswordValid,
  getPasswordRequirements,
} from '../authValidation';

describe('validatePassword', () => {
  it('returns minLength error for short passwords', () => {
    const errors = validatePassword('Ab1!');
    expect(errors.minLength).toBeDefined();
  });

  it('returns uppercase error when no uppercase', () => {
    const errors = validatePassword('password1!');
    expect(errors.uppercase).toBeDefined();
  });

  it('returns number error when no digit', () => {
    const errors = validatePassword('Password!');
    expect(errors.number).toBeDefined();
  });

  it('returns symbol error when no symbol', () => {
    const errors = validatePassword('Password1');
    expect(errors.symbol).toBeDefined();
  });

  it('does NOT accept underscore as a valid symbol', () => {
    const errors = validatePassword('Password1_');
    expect(errors.symbol).toBeDefined();
  });

  it('returns empty errors for a valid password', () => {
    const errors = validatePassword('MyP@ss1!');
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('returns multiple errors when multiple requirements are unmet', () => {
    const errors = validatePassword('abc');
    expect(errors.minLength).toBeDefined();
    expect(errors.uppercase).toBeDefined();
    expect(errors.number).toBeDefined();
    expect(errors.symbol).toBeDefined();
  });
});

describe('isPasswordValid', () => {
  it('returns false for a weak password', () => {
    expect(isPasswordValid('abc123')).toBe(false);
  });

  it('returns true for a valid password', () => {
    expect(isPasswordValid('MyP@ssw0rd')).toBe(true);
  });
});

describe('getPasswordRequirements', () => {
  it('returns 4 requirements', () => {
    expect(getPasswordRequirements('anything')).toHaveLength(4);
  });

  it('marks requirements as met when satisfied', () => {
    const reqs = getPasswordRequirements('MyP@ss1!');
    expect(reqs.every((r) => r.met)).toBe(true);
  });

  it('marks requirements as unmet when not satisfied', () => {
    const reqs = getPasswordRequirements('abc');
    expect(reqs.every((r) => !r.met)).toBe(true);
  });

  it('marks only met requirements for partially valid password', () => {
    // Has uppercase + length, missing number and symbol
    const reqs = getPasswordRequirements('MyPassword');
    const metKeys = reqs.filter((r) => r.met).map((r) => r.key);
    expect(metKeys).toContain('minLength');
    expect(metKeys).toContain('uppercase');
    expect(metKeys).not.toContain('number');
    expect(metKeys).not.toContain('symbol');
  });
});
