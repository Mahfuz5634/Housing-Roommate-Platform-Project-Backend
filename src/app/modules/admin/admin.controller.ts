import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AdminService } from './admin.service';

const getDashboardAnalytics = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getDashboardAnalytics();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin dashboard analytics retrieved successfully!',
    data: result,
  });
});

const approveProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isApproved } = req.body;

  const result = await AdminService.approvePropertyListing(id, isApproved !== false);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Property listing ${isApproved !== false ? 'approved' : 'rejected'} successfully!`,
    data: result,
  });
});

export const AdminController = {
  getDashboardAnalytics,
  approveProperty,
};
