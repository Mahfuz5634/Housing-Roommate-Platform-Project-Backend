import { MaintenanceCategory, MaintenancePriority, MaintenanceStatus, UserRole } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../../utils/prisma';
import ApiError from '../../errors/ApiError';

type TCreateMaintenancePayload = {
  propertyId: string;
  roomId?: string;
  category?: MaintenanceCategory;
  priority?: MaintenancePriority;
  title: string;
  description: string;
  images?: string[];
};

const createMaintenanceRequest = async (tenantId: string, payload: TCreateMaintenancePayload) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });

  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found!');
  }

  const request = await prisma.maintenanceRequest.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      roomId: payload.roomId || null,
      category: payload.category || MaintenanceCategory.OTHER,
      priority: payload.priority || MaintenancePriority.MEDIUM,
      status: MaintenanceStatus.PENDING,
      title: payload.title,
      description: payload.description,
      images: payload.images || [],
    },
    include: {
      property: true,
      room: true,
    },
  });

  return request;
};

const getMyMaintenanceRequests = async (tenantId: string) => {
  const requests = await prisma.maintenanceRequest.findMany({
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
    },
    orderBy: { createdAt: 'desc' },
  });

  return requests;
};

const getLandlordMaintenanceRequests = async (landlordId: string) => {
  const requests = await prisma.maintenanceRequest.findMany({
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
        },
      },
      property: true,
      room: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return requests;
};

const getAllMaintenanceRequests = async () => {
  const requests = await prisma.maintenanceRequest.findMany({
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
    },
    orderBy: { createdAt: 'desc' },
  });

  return requests;
};

const updateMaintenanceStatus = async (
  requestId: string,
  userId: string,
  userRole: UserRole,
  status: MaintenanceStatus,
) => {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: { property: true },
  });

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Maintenance request not found!');
  }

  if (userRole !== UserRole.ADMIN && request.property.landlordId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Only the property landlord or an admin can update maintenance status!',
    );
  }

  const updated = await prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: { status },
    include: {
      property: true,
      room: true,
    },
  });

  return updated;
};

export const MaintenanceService = {
  createMaintenanceRequest,
  getMyMaintenanceRequests,
  getLandlordMaintenanceRequests,
  getAllMaintenanceRequests,
  updateMaintenanceStatus,
};
