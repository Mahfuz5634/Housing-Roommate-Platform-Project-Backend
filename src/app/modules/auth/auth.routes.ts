import { Router } from 'express';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { AuthValidation } from './auth.validation';
import { AuthController } from './auth.controller';

const router = Router();

router.post(
  '/register',
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.register,
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login,
);

router.post(
  '/google-login',
  validateRequest(AuthValidation.googleLoginValidationSchema),
  AuthController.googleLogin,
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthController.refreshToken,
);

router.patch(
  '/change-password',
  auth(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword,
);

router.get(
  '/me',
  auth(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT),
  AuthController.getCurrentUser,
);

export const AuthRoutes = router;
