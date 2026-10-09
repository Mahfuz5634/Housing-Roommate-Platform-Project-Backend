import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PropertyService } from './property.service';
import { PropertyStatus, PropertyType, UserRole } from '@prisma/client';

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user!.id;
  const result = await PropertyService.createProperty(landlordId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Property listed successfully!',
    data: result,
  });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const {
    searchTerm,
    propertyType,
    city,
    area,
    minRent,
    maxRent,
    bedrooms,
    status,
    amenities,
    page,
    limit,
    sortBy,
    sortOrder,
  } = req.query;

  const filters = {
    searchTerm: searchTerm as string,
    propertyType: propertyType as PropertyType,
    city: city as string,
    area: area as string,
    minRent: minRent ? Number(minRent) : undefined,
    maxRent: maxRent ? Number(maxRent) : undefined,
    bedrooms: bedrooms ? Number(bedrooms) : undefined,
    status: status as PropertyStatus,
    amenities: amenities ? (amenities as string).split(',') : undefined,
  };

  const options = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  };

  const result = await PropertyService.getAllProperties(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Properties retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getPropertyById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PropertyService.getPropertyById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property details retrieved successfully!',
    data: result,
  });
});

const getMyProperties = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user!.id;
  const { page, limit } = req.query;

  const options = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  };

  const result = await PropertyService.getMyProperties(landlordId, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My property listings retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role as UserRole;

  const result = await PropertyService.updateProperty(id, userId, userRole, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property updated successfully!',
    data: result,
  });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role as UserRole;

  const result = await PropertyService.deleteProperty(id, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property deleted successfully!',
    data: result,
  });
});

export const PropertyController = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
};
