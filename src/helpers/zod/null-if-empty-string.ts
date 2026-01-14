import z from 'zod';

export const nullIfEmptyString = z.preprocess(
  (val) => (val === '' ? null : val),
  z.string().nullable(),
);
