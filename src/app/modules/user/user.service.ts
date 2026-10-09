import { Prisma, UserRole, UserStatus } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../../utils/prisma';
import ApiError from '../../errors/ApiError';

type TUserFilterRequest = {
  searchTerm?: string;
  role?: UserRole;
  status?: UserStatus;
};

type TPaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

const getAllUsers = async (filters: TUserFilterRequest, options: TPaginationOptions) => {
  const page = Number(options.page || 1);
  const limit = Number(options.limit || 10);
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder || 'desc';

  const andConditions: Prisma.UserWhereInput[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { email: { contains: filters.searchTerm, mode: 'insensitive' } },
        { profile: { firstName: { contains: filters.searchTerm, mode: 'insensitive' } } },
        { profile: { lastName: { contains: filters.searchTerm, mode: 'insensitive' } } },
        { profile: { city: { contains: filters.searchTerm, mode: 'insensitive' } } },
      ],
    });
  }

  if (filters.role) {
    andConditions.push({ role: filters.role });
  }

  if (filters.status) {
    andConditions.push({ status: filters.status });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const users = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      isVerified: true,
      createdAt: true,
      profile: true,
    },
  });

  const total = await prisma.user.count({ where: whereConditions });
  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    data: users,
  };
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      profile: true,
      roommateProfile: true,
      properties: {
        where: { status: 'AVAILABLE' },
        take: 5,
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
  }

  return user;
};

const updateProfile = async (
  userId: string,
  payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    address?: string;
    city?: string;
  },
) => {
  const isProfileExist = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!isProfileExist) {
    const newProfile = await prisma.profile.create({
      data: {
        userId,
        firstName: payload.firstName || '',
        lastName: payload.lastName || '',
        phone: payload.phone || null,
        avatar: payload.avatar || null,
        bio: payload.bio || null,
        address: payload.address || null,
        city: payload.city || null,
      },
    });
    return newProfile;
  }

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: payload,
  });

  return updatedProfile;
};

const updateUserStatus = async (id: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const updateUserRole = async (id: string, role: UserRole) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const UserService = {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserStatus,
  updateUserRole,
};
