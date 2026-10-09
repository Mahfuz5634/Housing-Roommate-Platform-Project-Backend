import { UserRole } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../../utils/prisma';
import ApiError from '../../errors/ApiError';

type TCreateReviewPayload = {
  propertyId: string;
  rating: number;
  comment: string;
};

const createReview = async (authorId: string, payload: TCreateReviewPayload) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });

  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found!');
  }

  // Prevent landlord from reviewing their own property
  if (property.landlordId === authorId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot review your own property!');
  }

  // Check if tenant has already reviewed this property
  const existingReview = await prisma.review.findFirst({
    where: {
      authorId,
      propertyId: payload.propertyId,
    },
  });

  if (existingReview) {
    // Update existing review
    const updated = await prisma.review.update({
      where: { id: existingReview.id },
      data: {
        rating: payload.rating,
        comment: payload.comment,
      },
    });
    return updated;
  }

  const review = await prisma.review.create({
    data: {
      authorId,
      propertyId: payload.propertyId,
      rating: payload.rating,
      comment: payload.comment,
    },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
  });

  return review;
};

const getReviewsByProperty = async (propertyId: string) => {
  const reviews = await prisma.review.findMany({
    where: { propertyId },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const ratings = reviews.map((r) => r.rating);
  const averageRating =
    ratings.length > 0
      ? Number((ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(1))
      : 0;

  return {
    propertyId,
    averageRating,
    totalReviews: reviews.length,
    reviews,
  };
};

const getMyReviews = async (authorId: string) => {
  const reviews = await prisma.review.findMany({
    where: { authorId },
    include: {
      property: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return reviews;
};

const deleteReview = async (reviewId: string, userId: string, userRole: UserRole) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found!');
  }

  if (userRole !== UserRole.ADMIN && review.authorId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only delete your own reviews!');
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return { message: 'Review deleted successfully' };
};

export const ReviewService = {
  createReview,
  getReviewsByProperty,
  getMyReviews,
  deleteReview,
};
