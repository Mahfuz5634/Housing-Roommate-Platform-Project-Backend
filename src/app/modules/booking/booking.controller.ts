import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BookingService } from './booking.service';
import { UserRole } from '@prisma/client';

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.id;
  const result = await BookingService.createBookingRequest(tenantId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Booking request submitted successfully!',
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.id;
  const result = await BookingService.getMyBookings(tenantId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My bookings retrieved successfully!',
    data: result,
  });
});

const getLandlordBookings = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user!.id;
  const result = await BookingService.getLandlordBookings(landlordId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property booking requests retrieved successfully!',
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getAllBookings();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All platform bookings retrieved successfully!',
    data: result,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role as UserRole;
  const result = await BookingService.getBookingById(id, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking details retrieved successfully!',
    data: result,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role as UserRole;
  const { status } = req.body;

  const result = await BookingService.updateBookingStatus(id, userId, userRole, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Booking status updated to ${status}!`,
    data: result,
  });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.id;

  const result = await BookingService.cancelBooking(id, tenantId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking request cancelled successfully!',
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getMyBookings,
  getLandlordBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
};
