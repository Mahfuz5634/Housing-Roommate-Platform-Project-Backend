import { Prisma, PropertyStatus, PropertyType, UserRole } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../../utils/prisma';
import ApiError from '../../errors/ApiError';

type TCreatePropertyPayload = {
  title: string;
  description: string;
  propertyType?: PropertyType;
  address: string;
  city: string;
  area: string;
  totalRent: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  rules?: string[];
  images?: string[];
};

type TPropertyFilterRequest = {
  searchTerm?: string;
  propertyType?: PropertyType;
  city?: string;
  area?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  status?: PropertyStatus;
  amenities?: string[];
};

type TPaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

const createProperty = async (landlordId: string, payload: TCreatePropertyPayload) => {
  const property = await prisma.property.create({
    data: {
      landlordId,
      ...payload,
    },
  });

  return property;
};

const getAllProperties = async (filters: TPropertyFilterRequest, options: TPaginationOptions) => {
  const page = Number(options.page || 1);
  const limit = Number(options.limit || 10);
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder || 'desc';

  const andConditions: Prisma.PropertyWhereInput[] = [];

  // Default to showing only approved listings
  andConditions.push({ isApproved: true });

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: filters.searchTerm, mode: 'insensitive' } },
        { description: { contains: filters.searchTerm, mode: 'insensitive' } },
        { city: { contains: filters.searchTerm, mode: 'insensitive' } },
        { area: { contains: filters.searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (filters.city) {
    andConditions.push({ city: { equals: filters.city, mode: 'insensitive' } });
  }

  if (filters.area) {
    andConditions.push({ area: { equals: filters.area, mode: 'insensitive' } });
  }

  if (filters.propertyType) {
    andConditions.push({ propertyType: filters.propertyType });
  }

  if (filters.status) {
    andConditions.push({ status: filters.status });
  } else {
    andConditions.push({ status: PropertyStatus.AVAILABLE });
  }

  if (filters.minRent !== undefined) {
    andConditions.push({ totalRent: { gte: filters.minRent } });
  }

  if (filters.maxRent !== undefined) {
    andConditions.push({ totalRent: { lte: filters.maxRent } });
  }

  if (filters.bedrooms !== undefined) {
    andConditions.push({ bedrooms: { gte: filters.bedrooms } });
  }

  if (filters.amenities && filters.amenities.length > 0) {
    andConditions.push({
      amenities: { hasSome: filters.amenities },
    });
  }

  const whereConditions: Prisma.PropertyWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const properties = await prisma.property.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      landlord: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      rooms: {
        where: { isAvailable: true },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });

  const total = await prisma.property.count({ where: whereConditions });
  const totalPage = Math.ceil(total / limit);

  // Map to include calculated average rating
  const formattedProperties = properties.map((prop) => {
    const ratings = prop.reviews.map((r) => r.rating);
    const avgRating =
      ratings.length > 0
        ? Number((ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(1))
        : null;

    return {
      ...prop,
      averageRating: avgRating,
      totalReviews: ratings.length,
    };
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    data: formattedProperties,
  };
};

const getPropertyById = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      landlord: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      rooms: true,
      reviews: {
        include: {
          author: {
            select: {
              id: true,
              email: true,
              profile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found!');
  }

  const ratings = property.reviews.map((r) => r.rating);
  const avgRating =
    ratings.length > 0
      ? Number((ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(1))
      : null;

  return {
    ...property,
    averageRating: avgRating,
    totalReviews: ratings.length,
  };
};

const getMyProperties = async (landlordId: string, options: TPaginationOptions) => {
  const page = Number(options.page || 1);
  const limit = Number(options.limit || 10);
  const skip = (page - 1) * limit;

  const properties = await prisma.property.findMany({
    where: { landlordId },
    skip,
    take: limit,
    include: {
      rooms: true,
      bookings: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.property.count({ where: { landlordId } });
  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    data: properties,
  };
};

const updateProperty = async (
  propertyId: string,
  userId: string,
  userRole: UserRole,
  payload: Partial<TCreatePropertyPayload> & { status?: PropertyStatus; isApproved?: boolean },
) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found!');
  }

  // Only the owner landlord or an ADMIN can update
  if (userRole !== UserRole.ADMIN && property.landlordId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Forbidden! You do not have permission to edit this property listing.',
    );
  }

  const updatedProperty = await prisma.property.update({
    where: { id: propertyId },
    data: payload,
  });

  return updatedProperty;
};

const deleteProperty = async (propertyId: string, userId: string, userRole: UserRole) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found!');
  }

  if (userRole !== UserRole.ADMIN && property.landlordId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Forbidden! You do not have permission to delete this property listing.',
    );
  }

  await prisma.property.delete({
    where: { id: propertyId },
  });

  return { message: 'Property deleted successfully' };
};

export const PropertyService = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
};
