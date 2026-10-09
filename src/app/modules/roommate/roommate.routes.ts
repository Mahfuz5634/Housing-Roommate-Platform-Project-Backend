import { Router } from 'express';
import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { RoommateValidation } from './roommate.validation';
import { RoommateController } from './roommate.controller';

const router = Router();

router.post(
  '/profile',
  auth(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN),
  validateRequest(RoommateValidation.upsertRoommateProfileSchema),
  RoommateController.upsertProfile,
);

router.get(
  '/profile/me',
  auth(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN),
  RoommateController.getMyProfile,
);

router.get(
  '/match',
  auth(UserRole.TENANT),
  RoommateController.getMatches,
);

router.get(
  '/',
  auth(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN),
  RoommateController.getAllProfiles,
);

export const RoommateRoutes = router;
