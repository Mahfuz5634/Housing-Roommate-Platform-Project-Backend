import { Router } from 'express';
import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { BookingValidation } from './booking.validation';
import { BookingController } from './booking.controller';

const router = Router();

router.post(
  '/',
  auth(UserRole.TENANT),
  validateRequest(BookingValidation.createBookingValidationSchema),
  BookingController.createBooking,
);

router.get(
  '/my-bookings',
  auth(UserRole.TENANT),
  BookingController.getMyBookings,
);

router.get(
  '/landlord',
  auth(UserRole.LANDLORD, UserRole.ADMIN),
  BookingController.getLandlordBookings,
);

router.get(
  '/all',
  auth(UserRole.ADMIN),
  BookingController.getAllBookings,
);

router.get(
  '/:id',
  auth(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN),
  BookingController.getBookingById,
);

router.patch(
  '/:id/status',
  auth(UserRole.LANDLORD, UserRole.ADMIN),
  validateRequest(BookingValidation.updateBookingStatusValidationSchema),
  BookingController.updateBookingStatus,
);

router.patch(
  '/:id/cancel',
  auth(UserRole.TENANT),
  BookingController.cancelBooking,
);

export const BookingRoutes = router;
