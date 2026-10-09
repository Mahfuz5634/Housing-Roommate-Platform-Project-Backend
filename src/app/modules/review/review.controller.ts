import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReviewService } from './review.service';
import { UserRole } from '@prisma/client';

const createReview = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user!.id;
  const result = await ReviewService.createReview(authorId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review posted successfully!',
    data: result,
  });
});

const getReviewsByProperty = catchAsync(async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const result = await ReviewService.getReviewsByProperty(propertyId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property reviews retrieved successfully!',
    data: result,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user!.id;
  const result = await ReviewService.getMyReviews(authorId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My reviews retrieved successfully!',
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role as UserRole;

  const result = await ReviewService.deleteReview(id, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted successfully!',
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getReviewsByProperty,
  getMyReviews,
  deleteReview,
};
