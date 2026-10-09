import { Router } from 'express';
import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';

const router = Router();

router.get(
  '/',
  auth(UserRole.ADMIN),
  UserController.getAllUsers,
);

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT),
  UserController.getUserById,
);

router.patch(
  '/profile',
  auth(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT),
  validateRequest(UserValidation.updateProfileValidationSchema),
  UserController.updateProfile,
);

router.patch(
  '/:id/status',
  auth(UserRole.ADMIN),
  validateRequest(UserValidation.updateUserStatusValidationSchema),
  UserController.updateUserStatus,
);

router.patch(
  '/:id/role',
  auth(UserRole.ADMIN),
  validateRequest(UserValidation.updateUserRoleValidationSchema),
  UserController.updateUserRole,
);

export const UserRoutes = router;
