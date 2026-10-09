import { BookingStatus, PropertyStatus, UserRole } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../../utils/prisma';
import ApiError from '../../errors/ApiError';

type TCreateBookingPayload = {
  propertyId: string;
  roomId?: string;
  moveInDate: string;
  moveOutDate?: string;
  notes?: string;
};

const createBookingRequest = async (tenantId: string, payload: TCreateBookingPayload) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
    include: { rooms: true },
  });

  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Target property not found!');
  }

  if (property.status !== PropertyStatus.AVAILABLE || !property.isApproved) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This property is not currently available for booking!');
  }

  if (property.landlordId === tenantId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot book your own property listing!');
  }

  let totalAmount = property.totalRent;
  let depositAmount = property.totalRent * 0.5; // Default 50% deposit

  if (payload.roomId) {
    const room = property.rooms.find((r) => r.id === payload.roomId);
    if (!room) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Target room not found in this property!');
    }
    if (!room.isAvailable || room.currentOccupancy >= room.capacity) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Target room is already fully occupied!');
    }
    totalAmount = room.rentAmount;
    depositAmount = room.depositAmount || room.rentAmount * 0.5;
  }

  // Prevent duplicate pending bookings
  const existingPending = await prisma.bookingRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: BookingStatus.PENDING,
    },
  });

  if (existingPending) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You already have a pending booking request for this property!',
    );
  }

  const booking = await prisma.bookingRequest.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      roomId: payload.roomId || null,
      moveInDate: new Date(payload.moveInDate),
      moveOutDate: payload.moveOutDate ? new Date(payload.moveOutDate) : null,
      status: BookingStatus.PENDING,
      totalAmount,
      depositAmount,
      notes: payload.notes || null,
    },
    include: {
      property: true,
      room: true,
    },
  });

  return booking;
};

const getMyBookings = async (tenantId: string) => {
  const bookings = await prisma.bookingRequest.findMany({
    where: { tenantId },
    include: {
      property: {
        include: {
          landlord: {
            select: {
              id: true,
              email: true,
              profile: true,
            },
          },
        },
      },
      room: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return bookings;
};

const getLandlordBookings = async (landlordId: string) => {
  const bookings = await prisma.bookingRequest.findMany({
    where: {
      property: {
        landlordId,
      },
    },
    include: {
      tenant: {
        select: {
          id: true,
          email: true,
          profile: true,
          roommateProfile: true,
        },
      },
      property: true,
      room: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return bookings;
};

const getAllBookings = async () => {
  const bookings = await prisma.bookingRequest.findMany({
    include: {
      tenant: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      property: true,
      room: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return bookings;
};

const getBookingById = async (id: string, userId: string, userRole: UserRole) => {
  const booking = await prisma.bookingRequest.findUnique({
    where: { id },
    include: {
      tenant: {
        select: {
          id: true,
          email: true,
          profile: true,
          roommateProfile: true,
        },
      },
      property: {
        include: {
          landlord: {
            select: {
              id: true,
              email: true,
              profile: true,
            },
          },
        },
      },
      room: true,
      payment: true,
    },
  });

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking request not found!');
  }

  // Authorization check
  if (
    userRole !== UserRole.ADMIN &&
    booking.tenantId !== userId &&
    booking.property.landlordId !== userId
  ) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You are not authorized to view this booking request!',
    );
  }

  return booking;
};

const updateBookingStatus = async (
  bookingId: string,
  userId: string,
  userRole: UserRole,
  status: BookingStatus,
) => {
  const booking = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    include: { property: true },
  });

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking request not found!');
  }

  if (userRole !== UserRole.ADMIN && booking.property.landlordId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Only the property landlord or an admin can update booking status!',
    );
  }

  const updatedBooking = await prisma.bookingRequest.update({
    where: { id: bookingId },
    data: { status },
    include: {
      property: true,
      room: true,
    },
  });

  return updatedBooking;
};

const cancelBooking = async (bookingId: string, tenantId: string) => {
  const booking = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking request not found!');
  }

  if (booking.tenantId !== tenantId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only cancel your own booking requests!');
  }

  if (booking.status !== BookingStatus.PENDING) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot cancel booking in '${booking.status}' status! Only PENDING bookings can be cancelled.`,
    );
  }

  const cancelledBooking = await prisma.bookingRequest.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
  });

  return cancelledBooking;
};

export const BookingService = {
  createBookingRequest,
  getMyBookings,
  getLandlordBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
};
