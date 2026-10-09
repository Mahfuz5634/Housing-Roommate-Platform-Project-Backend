import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentService } from './payment.service';

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.id;
  const { bookingRequestId } = req.body;
  const result = await PaymentService.createCheckoutSession(tenantId, bookingRequestId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stripe checkout session initialized successfully!',
    data: result,
  });
});

const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const { sessionId, bookingRequestId } = req.body;
  const result = await PaymentService.verifyPayment(sessionId, bookingRequestId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment verified and booking confirmed successfully!',
    data: result,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.id;
  const result = await PaymentService.getMyPayments(tenantId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My payments retrieved successfully!',
    data: result,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPayments();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All platform payment transactions retrieved successfully!',
    data: result,
  });
});

export const PaymentController = {
  createCheckoutSession,
  verifyPayment,
  getMyPayments,
  getAllPayments,
};
