import { z } from 'zod';
import { UserRole, UserStatus } from '@prisma/client';

const updateProfileValidationSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
    address: z.string().optional(),
    city: z.string().optional(),
  }),
});

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.nativeEnum(UserStatus, { required_error: 'Status is required' }),
  }),
});

const updateUserRoleValidationSchema = z.object({
  body: z.object({
    role: z.nativeEnum(UserRole, { required_error: 'Role is required' }),
  }),
});

export const UserValidation = {
  updateProfileValidationSchema,
  updateUserStatusValidationSchema,
  updateUserRoleValidationSchema,
};
