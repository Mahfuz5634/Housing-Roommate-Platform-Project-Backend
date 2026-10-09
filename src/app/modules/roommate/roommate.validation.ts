import { z } from 'zod';
import { GenderPreference, SleepSchedule } from '@prisma/client';

const upsertRoommateProfileSchema = z.object({
  body: z.object({
    budgetMin: z
      .number({ required_error: 'Minimum budget is required' })
      .min(0, 'Minimum budget cannot be negative'),
    budgetMax: z
      .number({ required_error: 'Maximum budget is required' })
      .min(0, 'Maximum budget cannot be negative'),
    preferredGender: z.nativeEnum(GenderPreference).optional(),
    occupation: z.string().optional(),
    sleepSchedule: z.nativeEnum(SleepSchedule).optional(),
    smoking: z.boolean().optional(),
    pets: z.boolean().optional(),
    cleanlinessScore: z
      .number()
      .min(1, 'Cleanliness score must be between 1 and 5')
      .max(5, 'Cleanliness score must be between 1 and 5')
      .optional(),
    preferredLocations: z.array(z.string()).optional(),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  }),
});

export const RoommateValidation = {
  upsertRoommateProfileSchema,
};
