import { UserRole } from '@prisma/client';

export type TJwtPayload = {
  id: string;
  email: string;
  role: UserRole;
};

declare global {
  namespace Express {
    interface Request {
      user?: TJwtPayload;
    }
  }
}
