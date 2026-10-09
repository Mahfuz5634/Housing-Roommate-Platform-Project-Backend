import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceStatus, UserRole } from '@prisma/client';

const createMaintenanceRequest = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.id;
  const result = await MaintenanceService.createMaintenanceRequest(tenantId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Maintenance ticket created successfully!',
    data: result,
  });
});

const getMyMaintenanceRequests = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.id;
  const result = await MaintenanceService.getMyMaintenanceRequests(tenantId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My maintenance requests retrieved successfully!',
    data: result,
  });
});

const getLandlordMaintenanceRequests = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user!.id;
  const result = await MaintenanceService.getLandlordMaintenanceRequests(landlordId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Maintenance tickets for your properties retrieved successfully!',
    data: result,
  });
});

const getAllMaintenanceRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await MaintenanceService.getAllMaintenanceRequests();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All platform maintenance requests retrieved successfully!',
    data: result,
  });
});

const updateMaintenanceStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role as UserRole;
  const { status } = req.body;

  const result = await MaintenanceService.updateMaintenanceStatus(id, userId, userRole, status as MaintenanceStatus);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Maintenance status updated to ${status}!`,
    data: result,
  });
});

export const MaintenanceController = {
  createMaintenanceRequest,
  getMyMaintenanceRequests,
  getLandlordMaintenanceRequests,
  getAllMaintenanceRequests,
  updateMaintenanceStatus,
};
