import z from 'zod';

export const SendAccessCodeSchema = z.object({
  email: z.string().email({
    message: 'Invalid email address',
  }),
});

export const CreateEmployeeSchema = z.object({
  email: z.string().email({
    message: 'Invalid email address',
  }),
  name: z.string().min(2).max(100),
  department: z.string().min(2).max(100),
});
