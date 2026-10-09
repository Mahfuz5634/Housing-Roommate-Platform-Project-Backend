import { GenderPreference, Prisma, SleepSchedule } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../../utils/prisma';
import ApiError from '../../errors/ApiError';

type TUpsertRoommatePayload = {
  budgetMin: number;
  budgetMax: number;
  preferredGender?: GenderPreference;
  occupation?: string;
  sleepSchedule?: SleepSchedule;
  smoking?: boolean;
  pets?: boolean;
  cleanlinessScore?: number;
  preferredLocations?: string[];
  bio?: string;
};

const upsertRoommateProfile = async (userId: string, payload: TUpsertRoommatePayload) => {
  if (payload.budgetMin > payload.budgetMax) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Minimum budget cannot be greater than maximum budget!',
    );
  }

  const existingProfile = await prisma.roommateProfile.findUnique({
    where: { userId },
  });

  if (existingProfile) {
    const updated = await prisma.roommateProfile.update({
      where: { userId },
      data: payload,
    });
    return updated;
  }

  const created = await prisma.roommateProfile.create({
    data: {
      userId,
      ...payload,
    },
  });

  return created;
};

const getMyRoommateProfile = async (userId: string) => {
  const profile = await prisma.roommateProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
  });

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Roommate profile not created yet!');
  }

  return profile;
};

const getAllRoommateProfiles = async (
  filters: {
    minBudget?: number;
    maxBudget?: number;
    sleepSchedule?: SleepSchedule;
    smoking?: boolean;
    pets?: boolean;
    city?: string;
  },
  pagination: {
    page?: number;
    limit?: number;
  },
) => {
  const page = Number(pagination.page || 1);
  const limit = Number(pagination.limit || 10);
  const skip = (page - 1) * limit;

  const whereConditions: Prisma.RoommateProfileWhereInput = {
    user: {
      status: 'ACTIVE',
    },
  };

  if (filters.minBudget) {
    whereConditions.budgetMax = { gte: filters.minBudget };
  }

  if (filters.maxBudget) {
    whereConditions.budgetMin = { lte: filters.maxBudget };
  }

  if (filters.sleepSchedule) {
    whereConditions.sleepSchedule = filters.sleepSchedule;
  }

  if (filters.smoking !== undefined) {
    whereConditions.smoking = filters.smoking;
  }

  if (filters.pets !== undefined) {
    whereConditions.pets = filters.pets;
  }

  if (filters.city) {
    whereConditions.preferredLocations = { has: filters.city };
  }

  const profiles = await prisma.roommateProfile.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const total = await prisma.roommateProfile.count({ where: whereConditions });
  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    data: profiles,
  };
};

// Algorithmic Compatibility Calculation Engine
const getCompatibilityMatches = async (userId: string) => {
  const myProfile = await prisma.roommateProfile.findUnique({
    where: { userId },
  });

  if (!myProfile) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Please create your roommate profile first before running compatibility matching!',
    );
  }

  // Fetch all other active roommate profiles
  const otherProfiles = await prisma.roommateProfile.findMany({
    where: {
      userId: { not: userId },
      user: { status: 'ACTIVE' },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
  });

  const matches = otherProfiles.map((candidate) => {
    let score = 0;

    // 1. Budget Overlap (Weight: 30%)
    const overlapMin = Math.max(myProfile.budgetMin, candidate.budgetMin);
    const overlapMax = Math.min(myProfile.budgetMax, candidate.budgetMax);
    if (overlapMax >= overlapMin) {
      const overlapSpan = overlapMax - overlapMin;
      const mySpan = Math.max(1, myProfile.budgetMax - myProfile.budgetMin);
      const ratio = Math.min(1, overlapSpan / mySpan);
      score += Math.round(ratio * 30);
    }

    // 2. Cleanliness Alignment (Weight: 20%)
    const cleanDiff = Math.abs(myProfile.cleanlinessScore - candidate.cleanlinessScore);
    const cleanScore = Math.max(0, 20 - cleanDiff * 5);
    score += cleanScore;

    // 3. Sleep Schedule Compatibility (Weight: 20%)
    if (myProfile.sleepSchedule === candidate.sleepSchedule) {
      score += 20;
    } else if (
      myProfile.sleepSchedule === SleepSchedule.FLEXIBLE ||
      candidate.sleepSchedule === SleepSchedule.FLEXIBLE
    ) {
      score += 15;
    } else {
      score += 5;
    }

    // 4. Smoking & Pet Lifestyle (Weight: 20%)
    if (myProfile.smoking === candidate.smoking) {
      score += 10;
    }
    if (myProfile.pets === candidate.pets) {
      score += 10;
    }

    // 5. Preferred Location Match (Weight: 10%)
    const commonLocations = myProfile.preferredLocations.filter((loc) =>
      candidate.preferredLocations.some((cLoc) => cLoc.toLowerCase() === loc.toLowerCase()),
    );
    if (commonLocations.length > 0) {
      score += 10;
    }

    // Clamp score to 100%
    const compatibilityPercentage = Math.min(100, Math.max(0, score));

    return {
      candidateProfile: candidate,
      compatibilityPercentage,
      matchedFactors: {
        hasBudgetOverlap: overlapMax >= overlapMin,
        cleanlinessDifference: cleanDiff,
        sharedSleepSchedule: myProfile.sleepSchedule === candidate.sleepSchedule,
        smokingMatch: myProfile.smoking === candidate.smoking,
        petsMatch: myProfile.pets === candidate.pets,
        commonLocations,
      },
    };
  });

  // Sort descending by highest compatibility
  matches.sort((a, b) => b.compatibilityPercentage - a.compatibilityPercentage);

  return matches;
};

export const RoommateService = {
  upsertRoommateProfile,
  getMyRoommateProfile,
  getAllRoommateProfiles,
  getCompatibilityMatches,
};
