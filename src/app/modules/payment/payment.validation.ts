import { z } from 'zod';

const createCheckoutSessionSchema = z.object({
  body: z.object({
    bookingRequestId: z
      .string({ required_error: 'Booking Request ID is required' })
      .uuid('Invalid Booking Request ID'),
  }),
});

const verifyPaymentSchema = z.object({
  body: z.object({
    sessionId: z.string({ required_error: 'Stripe Session ID or Payment Intent ID is required' }),
    bookingRequestId: z.string({ required_error: 'Booking Request ID is required' }).uuid(),
  }),
});

export const PaymentValidation = {
  createCheckoutSessionSchema,
  verifyPaymentSchema,
};
