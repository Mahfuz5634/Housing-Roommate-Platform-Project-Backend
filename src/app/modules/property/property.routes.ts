import { Router } from 'express';
import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PropertyValidation } from './property.validation';
import { PropertyController } from './property.controller';

const router = Router();

router.post(
  '/',
  auth(UserRole.LANDLORD, UserRole.ADMIN),
  validateRequest(PropertyValidation.createPropertyValidationSchema),
  PropertyController.createProperty,
);

router.get(
  '/',
  PropertyController.getAllProperties,
);

router.get(
  '/my-listings',
  auth(UserRole.LANDLORD, UserRole.ADMIN),
  PropertyController.getMyProperties,
);

router.get(
  '/:id',
  PropertyController.getPropertyById,
);

router.patch(
  '/:id',
  auth(UserRole.LANDLORD, UserRole.ADMIN),
  validateRequest(PropertyValidation.updatePropertyValidationSchema),
  PropertyController.updateProperty,
);

router.delete(
  '/:id',
  auth(UserRole.LANDLORD, UserRole.ADMIN),
  PropertyController.deleteProperty,
);

export const PropertyRoutes = router;
