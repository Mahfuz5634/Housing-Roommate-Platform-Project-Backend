import { Router } from 'express';
import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewValidation } from './review.validation';
import { ReviewController } from './review.controller';

const router = Router();

router.post(
  '/',
  auth(UserRole.TENANT),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReview,
);

router.get(
  '/property/:propertyId',
  ReviewController.getReviewsByProperty,
);

router.get(
  '/my-reviews',
  auth(UserRole.TENANT),
  ReviewController.getMyReviews,
);

router.delete(
  '/:id',
  auth(UserRole.TENANT, UserRole.ADMIN),
  ReviewController.deleteReview,
);

export const ReviewRoutes = router;
