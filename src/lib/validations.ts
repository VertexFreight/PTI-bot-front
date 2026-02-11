// src/lib/validations.ts

import { z } from 'zod';

export const ptiSchema = z.object({
  driverName: z
    .string()
    .max(100, 'Max 100 characters')
    .optional()
    .or(z.literal('')),

  unitNumber: z
    .string()
    .min(1, 'Unit number is required')
    .max(20, 'Max 20 characters')
    .regex(/^[A-Za-z0-9-]+$/, 'Only letters, numbers, dashes'),

  trailerNumber: z
    .string()
    .max(20)
    .optional()
    .or(z.literal('')),

  odometer: z
    .number({ invalid_type_error: 'Required' })
    .min(0, 'Cannot be negative'),
});

export type PTIFormValues = z.infer<typeof ptiSchema>;