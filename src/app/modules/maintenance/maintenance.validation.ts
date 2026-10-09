import { z } from 'zod';
import { MaintenanceCategory, MaintenancePriority, MaintenanceStatus } from '@prisma/client';

const createMaintenanceValidationSchema = z.object({
  body: z.object({
    propertyId: z.string({ required_error: 'Property ID is required' }).uuid(),
    roomId: z.string().uuid().optional(),
    category: z.nativeEnum(MaintenanceCategory).optional(),
    priority: z.nativeEnum(MaintenancePriority).optional(),
    title: z.string({ required_error: 'Title is required' }).min(3, 'Title must be at least 3 characters'),
    description: z.string({ required_error: 'Description is required' }).min(5, 'Description must be at least 5 characters'),
    images: z.array(z.string()).optional(),
  }),
});

const updateMaintenanceStatusValidationSchema = z.object({
  body: z.object({
    status: z.nativeEnum(MaintenanceStatus, { required_error: 'Status is required' }),
  }),
});

export const MaintenanceValidation = {
  createMaintenanceValidationSchema,
  updateMaintenanceStatusValidationSchema,
};
