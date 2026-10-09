import { z } from 'zod';

const createReviewValidationSchema = z.object({
  body: z.object({
    propertyId: z.string({ required_error: 'Property ID is required' }).uuid(),
    rating: z
      .number({ required_error: 'Rating is required' })
      .int()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5'),
    comment: z
      .string({ required_error: 'Comment is required' })
      .min(3, 'Comment must be at least 3 characters')
      .max(500, 'Comment cannot exceed 500 characters'),
  }),
});

export const ReviewValidation = {
  createReviewValidationSchema,
};
