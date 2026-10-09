import { z } from 'zod';
import { UserRole } from '@prisma/client';

const registerValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long'),
    role: z.nativeEnum(UserRole).optional(),
    firstName: z.string({ required_error: 'First name is required' }).min(1, 'First name cannot be empty'),
    lastName: z.string({ required_error: 'Last name is required' }).min(1, 'Last name cannot be empty'),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password cannot be empty'),
  }),
});

const googleLoginValidationSchema = z.object({
  body: z.object({
    idToken: z.string({ required_error: 'Google ID token is required' }),
    role: z.nativeEnum(UserRole).optional(),
  }),
});

const refreshTokenValidationSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: 'Current password is required' }),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, 'New password must be at least 6 characters long'),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  googleLoginValidationSchema,
  refreshTokenValidationSchema,
  changePasswordValidationSchema,
};
