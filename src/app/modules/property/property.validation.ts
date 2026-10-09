import { z } from 'zod';
import { PropertyStatus, PropertyType } from '@prisma/client';

const createPropertyValidationSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(3, 'Title must be at least 3 characters'),
    description: z.string({ required_error: 'Description is required' }).min(10, 'Description must be at least 10 characters'),
    propertyType: z.nativeEnum(PropertyType).optional(),
    address: z.string({ required_error: 'Address is required' }),
    city: z.string({ required_error: 'City is required' }),
    area: z.string({ required_error: 'Area is required' }),
    totalRent: z.number({ required_error: 'Total rent is required' }).positive('Rent must be a positive number'),
    bedrooms: z.number().int().min(1).optional(),
    bathrooms: z.number().int().min(1).optional(),
    amenities: z.array(z.string()).optional(),
    rules: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
  }),
});

const updatePropertyValidationSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    propertyType: z.nativeEnum(PropertyType).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    area: z.string().optional(),
    totalRent: z.number().positive().optional(),
    bedrooms: z.number().int().min(1).optional(),
    bathrooms: z.number().int().min(1).optional(),
    amenities: z.array(z.string()).optional(),
    rules: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    status: z.nativeEnum(PropertyStatus).optional(),
    isApproved: z.boolean().optional(),
  }),
});

export const PropertyValidation = {
  createPropertyValidationSchema,
  updatePropertyValidationSchema,
};
