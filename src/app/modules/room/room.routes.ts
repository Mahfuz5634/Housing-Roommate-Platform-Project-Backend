import { Router } from 'express';
import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { RoomValidation } from './room.validation';
import { RoomController } from './room.controller';

const router = Router();

router.post(
  '/',
  auth(UserRole.LANDLORD, UserRole.ADMIN),
  validateRequest(RoomValidation.createRoomValidationSchema),
  RoomController.addRoom,
);

router.get(
  '/property/:propertyId',
  RoomController.getRoomsByProperty,
);

router.get(
  '/:id',
  RoomController.getRoomById,
);

router.patch(
  '/:id',
  auth(UserRole.LANDLORD, UserRole.ADMIN),
  validateRequest(RoomValidation.updateRoomValidationSchema),
  RoomController.updateRoom,
);

router.delete(
  '/:id',
  auth(UserRole.LANDLORD, UserRole.ADMIN),
  RoomController.deleteRoom,
);

export const RoomRoutes = router;
