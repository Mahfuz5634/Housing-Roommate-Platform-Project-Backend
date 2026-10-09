import { RoomType, UserRole } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../../utils/prisma';
import ApiError from '../../errors/ApiError';

type TCreateRoomPayload = {
  propertyId: string;
  title: string;
  roomType?: RoomType;
  rentAmount: number;
  depositAmount?: number;
  capacity?: number;
};

const addRoom = async (userId: string, userRole: UserRole, payload: TCreateRoomPayload) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });

  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Target property not found!');
  }

  if (userRole !== UserRole.ADMIN && property.landlordId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You are not authorized to add rooms to this property!',
    );
  }

  const room = await prisma.room.create({
    data: {
      propertyId: payload.propertyId,
      title: payload.title,
      roomType: payload.roomType || RoomType.PRIVATE,
      rentAmount: payload.rentAmount,
      depositAmount: payload.depositAmount || 0,
      capacity: payload.capacity || 1,
      currentOccupancy: 0,
      isAvailable: true,
    },
  });

  return room;
};

const getRoomsByProperty = async (propertyId: string) => {
  const rooms = await prisma.room.findMany({
    where: { propertyId },
    orderBy: { createdAt: 'asc' },
  });

  return rooms;
};

const getRoomById = async (id: string) => {
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      property: true,
    },
  });

  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Room not found!');
  }

  return room;
};

const updateRoom = async (
  roomId: string,
  userId: string,
  userRole: UserRole,
  payload: Partial<TCreateRoomPayload> & { currentOccupancy?: number; isAvailable?: boolean },
) => {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { property: true },
  });

  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Room not found!');
  }

  if (userRole !== UserRole.ADMIN && room.property.landlordId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You are not authorized to update this room!',
    );
  }

  // Auto toggle availability if occupancy hits capacity
  let isAvailable = payload.isAvailable !== undefined ? payload.isAvailable : room.isAvailable;
  const newOccupancy =
    payload.currentOccupancy !== undefined ? payload.currentOccupancy : room.currentOccupancy;
  const newCapacity = payload.capacity !== undefined ? payload.capacity : room.capacity;

  if (newOccupancy >= newCapacity) {
    isAvailable = false;
  }

  const updatedRoom = await prisma.room.update({
    where: { id: roomId },
    data: {
      ...payload,
      isAvailable,
    },
  });

  return updatedRoom;
};

const deleteRoom = async (roomId: string, userId: string, userRole: UserRole) => {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { property: true },
  });

  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Room not found!');
  }

  if (userRole !== UserRole.ADMIN && room.property.landlordId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You are not authorized to delete this room!',
    );
  }

  await prisma.room.delete({
    where: { id: roomId },
  });

  return { message: 'Room deleted successfully' };
};

export const RoomService = {
  addRoom,
  getRoomsByProperty,
  getRoomById,
  updateRoom,
  deleteRoom,
};
