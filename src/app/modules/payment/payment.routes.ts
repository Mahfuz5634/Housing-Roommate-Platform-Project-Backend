import { Router } from 'express';
import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentValidation } from './payment.validation';
import { PaymentController } from './payment.controller';

const router = Router();

router.post(
  '/checkout-session',
  auth(UserRole.TENANT),
  validateRequest(PaymentValidation.createCheckoutSessionSchema),
  PaymentController.createCheckoutSession,
);

router.post(
  '/verify',
  auth(UserRole.TENANT, UserRole.ADMIN),
  validateRequest(PaymentValidation.verifyPaymentSchema),
  PaymentController.verifyPayment,
);

router.get(
  '/my-payments',
  auth(UserRole.TENANT),
  PaymentController.getMyPayments,
);

router.get(
  '/all',
  auth(UserRole.ADMIN),
  PaymentController.getAllPayments,
);

export const PaymentRoutes = router;
