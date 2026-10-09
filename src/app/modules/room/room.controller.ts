import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RoomService } from './room.service';
import { UserRole } from '@prisma/client';

const addRoom = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role as UserRole;
  const result = await RoomService.addRoom(userId, userRole, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Room added successfully!',
    data: result,
  });
});

const getRoomsByProperty = catchAsync(async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const result = await RoomService.getRoomsByProperty(propertyId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rooms retrieved successfully!',
    data: result,
  });
});

const getRoomById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RoomService.getRoomById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Room details retrieved successfully!',
    data: result,
  });
});

const updateRoom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role as UserRole;

  const result = await RoomService.updateRoom(id, userId, userRole, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Room updated successfully!',
    data: result,
  });
});

const deleteRoom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role as UserRole;

  const result = await RoomService.deleteRoom(id, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Room deleted successfully!',
    data: result,
  });
});

export const RoomController = {
  addRoom,
  getRoomsByProperty,
  getRoomById,
  updateRoom,
  deleteRoom,
};
