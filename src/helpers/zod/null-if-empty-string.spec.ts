import { nullIfEmptyString } from './null-if-empty-string';

describe('nullableString()', () => {
  it('should convert to null if empty string passed', () => {
    const result = nullIfEmptyString.safeParse('');
    expect(result.success).toBe(true);
    expect(result.data).toBe(null);
  });
  it('should pass the regular string through unchanged', () => {
    const result = nullIfEmptyString.safeParse('string');
    expect(result.success).toBe(true);
    expect(result.data).toBe('string');
  });
  it('should only pass strings', () => {
    const result = nullIfEmptyString.safeParse(false);
    expect(result.success).toBe(false);
  });
});
