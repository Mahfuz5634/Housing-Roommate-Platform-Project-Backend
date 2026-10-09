import { Router } from 'express';
import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { MaintenanceValidation } from './maintenance.validation';
import { MaintenanceController } from './maintenance.controller';

const router = Router();

router.post(
  '/',
  auth(UserRole.TENANT),
  validateRequest(MaintenanceValidation.createMaintenanceValidationSchema),
  MaintenanceController.createMaintenanceRequest,
);

router.get(
  '/my-requests',
  auth(UserRole.TENANT),
  MaintenanceController.getMyMaintenanceRequests,
);

router.get(
  '/landlord',
  auth(UserRole.LANDLORD, UserRole.ADMIN),
  MaintenanceController.getLandlordMaintenanceRequests,
);

router.get(
  '/all',
  auth(UserRole.ADMIN),
  MaintenanceController.getAllMaintenanceRequests,
);

router.patch(
  '/:id/status',
  auth(UserRole.LANDLORD, UserRole.ADMIN),
  validateRequest(MaintenanceValidation.updateMaintenanceStatusValidationSchema),
  MaintenanceController.updateMaintenanceStatus,
);

export const MaintenanceRoutes = router;
