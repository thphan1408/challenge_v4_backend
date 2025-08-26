import z from 'zod';

export const createAccessCodeSchema = z.object({
  phoneNumber: z
    .string()
    .min(10)
    .max(15)
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
});

export const validateAccessCodeSchema = z.object({
  phoneNumber: z
    .string()
    .min(10)
    .max(15)
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  accessCode: z.string().length(6, 'Invalid access code'),
});
