import { BookingStatus, PaymentStatus, PropertyStatus, UserRole, UserStatus } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../../utils/prisma';
import ApiError from '../../errors/ApiError';

const getDashboardAnalytics = async () => {
  // 1. User stats
  const totalUsers = await prisma.user.count();
  const tenantsCount = await prisma.user.count({ where: { role: UserRole.TENANT } });
  const landlordsCount = await prisma.user.count({ where: { role: UserRole.LANDLORD } });
  const adminsCount = await prisma.user.count({ where: { role: UserRole.ADMIN } });
  const blockedUsersCount = await prisma.user.count({ where: { status: UserStatus.BLOCKED } });

  // 2. Property & Room stats
  const totalProperties = await prisma.property.count();
  const availableProperties = await prisma.property.count({
    where: { status: PropertyStatus.AVAILABLE, isApproved: true },
  });
  const rentedProperties = await prisma.property.count({
    where: { status: PropertyStatus.RENTED },
  });
  const totalRooms = await prisma.room.count();
  const occupiedRooms = await prisma.room.count({ where: { isAvailable: false } });

  // 3. Booking stats
  const totalBookings = await prisma.bookingRequest.count();
  const pendingBookings = await prisma.bookingRequest.count({
    where: { status: BookingStatus.PENDING },
  });
  const completedBookings = await prisma.bookingRequest.count({
    where: { status: BookingStatus.COMPLETED },
  });

  // 4. Financial & Revenue stats
  const completedPayments = await prisma.payment.findMany({
    where: { status: PaymentStatus.COMPLETED },
    select: { amount: true },
  });
  const totalRevenue = completedPayments.reduce((acc, curr) => acc + curr.amount, 0);

  // 5. Maintenance ticket stats
  const totalMaintenanceRequests = await prisma.maintenanceRequest.count();
  const pendingMaintenance = await prisma.maintenanceRequest.count({
    where: { status: 'PENDING' },
  });
  const resolvedMaintenance = await prisma.maintenanceRequest.count({
    where: { status: 'RESOLVED' },
  });

  // 6. Recent activity
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      profile: true,
    },
  });

  const recentPayments = await prisma.payment.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      tenant: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
  });

  return {
    users: {
      total: totalUsers,
      tenants: tenantsCount,
      landlords: landlordsCount,
      admins: adminsCount,
      blocked: blockedUsersCount,
    },
    properties: {
      total: totalProperties,
      available: availableProperties,
      rented: rentedProperties,
      rooms: {
        total: totalRooms,
        occupied: occupiedRooms,
      },
    },
    bookings: {
      total: totalBookings,
      pending: pendingBookings,
      completed: completedBookings,
    },
    financials: {
      totalRevenue,
      currency: 'USD',
      completedTransactionsCount: completedPayments.length,
    },
    maintenance: {
      total: totalMaintenanceRequests,
      pending: pendingMaintenance,
      resolved: resolvedMaintenance,
    },
    recentActivity: {
      users: recentUsers,
      payments: recentPayments,
    },
  };
};

const approvePropertyListing = async (propertyId: string, isApproved: boolean) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found!');
  }

  const updatedProperty = await prisma.property.update({
    where: { id: propertyId },
    data: { isApproved },
  });

  return updatedProperty;
};

export const AdminService = {
  getDashboardAnalytics,
  approvePropertyListing,
};
