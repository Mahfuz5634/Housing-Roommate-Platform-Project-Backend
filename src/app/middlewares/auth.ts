import { NextFunction, Request, Response } from 'express';
import { Secret } from 'jsonwebtoken';
import httpStatus from 'http-status';
import { UserRole, UserStatus } from '@prisma/client';
import ApiError from '../errors/ApiError';
import config from '../config';
import { jwtHelpers } from '../utils/jwtHelpers';
import prisma from '../utils/prisma';
import { TJwtPayload } from '../interfaces/index.d';

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Get Authorization token from headers or cookies
      let token = req.headers.authorization;
      if (token && token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
      } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized! Token is missing.');
      }

      // 2. Verify token
      let verifiedUser: TJwtPayload;
      try {
        verifiedUser = jwtHelpers.verifyToken(
          token,
          config.jwt.access_secret as Secret,
        ) as TJwtPayload;
      } catch (err) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired access token!');
      }

      // 3. Check if user still exists in database
      const user = await prisma.user.findUnique({
        where: { id: verifiedUser.id },
      });

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User belonging to this token no longer exists!');
      }

      // 4. Check if user is blocked
      if (user.status === UserStatus.BLOCKED) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Your account has been suspended by an administrator.');
      }

      // 5. Role based access authorization
      if (roles.length > 0 && !roles.includes(user.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Forbidden! You do not have permission to access this resource. Allowed roles: ${roles.join(', ')}`,
        );
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
