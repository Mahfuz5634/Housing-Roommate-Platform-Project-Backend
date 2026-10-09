import { z } from 'zod';
import { RoomType } from '@prisma/client';

const createRoomValidationSchema = z.object({
  body: z.object({
    propertyId: z.string({ required_error: 'Property ID is required' }).uuid('Invalid Property ID'),
    title: z.string({ required_error: 'Room title is required' }).min(2, 'Room title must be at least 2 characters'),
    roomType: z.nativeEnum(RoomType).optional(),
    rentAmount: z.number({ required_error: 'Rent amount is required' }).positive('Rent amount must be positive'),
    depositAmount: z.number().min(0, 'Deposit amount cannot be negative').optional(),
    capacity: z.number().int().min(1, 'Capacity must be at least 1 person').optional(),
  }),
});

const updateRoomValidationSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    roomType: z.nativeEnum(RoomType).optional(),
    rentAmount: z.number().positive().optional(),
    depositAmount: z.number().min(0).optional(),
    capacity: z.number().int().min(1).optional(),
    currentOccupancy: z.number().int().min(0).optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const RoomValidation = {
  createRoomValidationSchema,
  updateRoomValidationSchema,
};
