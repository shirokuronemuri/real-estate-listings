import { positiveCoercedInt } from './positive-coerced-int';

describe('positiveQueryInt schema', () => {
  it('accepts positive int strings', () => {
    const result = positiveCoercedInt.safeParse('12');
    expect(result.success).toBe(true);
  });
  it('rejects negative values', () => {
    const result = positiveCoercedInt.safeParse('-1');
    expect(result.success).toBe(false);
  });
  it('rejects non-ints', () => {
    const result = positiveCoercedInt.safeParse('1.5');
    expect(result.success).toBe(false);
  });
  it('rejects non-numbers', () => {
    const result = positiveCoercedInt.safeParse('nyaa');
    expect(result.success).toBe(false);
  });
  it('rejects empty string', () => {
    const result = positiveCoercedInt.safeParse('');
    expect(result.success).toBe(false);
  });
  it('passes numbers through', () => {
    const result = positiveCoercedInt.safeParse(8);
    expect(result.success).toBe(true);
  });
});
