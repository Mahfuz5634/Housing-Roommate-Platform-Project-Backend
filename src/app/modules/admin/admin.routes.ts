import { Router } from 'express';
import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';
import { AdminController } from './admin.controller';

const router = Router();

router.get(
  '/analytics',
  auth(UserRole.ADMIN),
  AdminController.getDashboardAnalytics,
);

router.patch(
  '/properties/:id/approve',
  auth(UserRole.ADMIN),
  AdminController.approveProperty,
);

export const AdminRoutes = router;
