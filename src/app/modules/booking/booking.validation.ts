import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

const createBookingValidationSchema = z.object({
  body: z.object({
    propertyId: z.string({ required_error: 'Property ID is required' }).uuid('Invalid Property ID'),
    roomId: z.string().uuid('Invalid Room ID').optional(),
    moveInDate: z.string({ required_error: 'Move-in date is required' }).datetime('Invalid date format (ISO 8601)'),
    moveOutDate: z.string().datetime('Invalid date format (ISO 8601)').optional(),
    notes: z.string().max(500).optional(),
  }),
});

const updateBookingStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([BookingStatus.APPROVED, BookingStatus.REJECTED, BookingStatus.COMPLETED], {
      required_error: 'Status must be APPROVED, REJECTED, or COMPLETED',
    }),
  }),
});

export const BookingValidation = {
  createBookingValidationSchema,
  updateBookingStatusValidationSchema,
};
