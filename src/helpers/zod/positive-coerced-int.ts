import z from 'zod';

// Used instead of z.coerce.number().int().positive()
// because it returns NaN in errors everywhere and isn't helpful
export const positiveCoercedInt = z.preprocess((val) => {
  if (typeof val !== 'string') return val;
  const num = Number(val);
  return Number.isNaN(num) ? val : num;
}, z.number().int().positive());
