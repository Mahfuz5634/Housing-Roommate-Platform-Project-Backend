import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RoommateService } from './roommate.service';
import { SleepSchedule } from '@prisma/client';

const upsertProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await RoommateService.upsertRoommateProfile(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Roommate profile saved successfully!',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await RoommateService.getMyRoommateProfile(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My roommate profile retrieved successfully!',
    data: result,
  });
});

const getAllProfiles = catchAsync(async (req: Request, res: Response) => {
  const { minBudget, maxBudget, sleepSchedule, smoking, pets, city, page, limit } = req.query;

  const filters = {
    minBudget: minBudget ? Number(minBudget) : undefined,
    maxBudget: maxBudget ? Number(maxBudget) : undefined,
    sleepSchedule: sleepSchedule as SleepSchedule,
    smoking: smoking !== undefined ? smoking === 'true' : undefined,
    pets: pets !== undefined ? pets === 'true' : undefined,
    city: city as string,
  };

  const pagination = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  };

  const result = await RoommateService.getAllRoommateProfiles(filters, pagination);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Roommate profiles retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getMatches = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await RoommateService.getCompatibilityMatches(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Compatible roommate matches retrieved successfully!',
    data: result,
  });
});

export const RoommateController = {
  upsertProfile,
  getMyProfile,
  getAllProfiles,
  getMatches,
};
