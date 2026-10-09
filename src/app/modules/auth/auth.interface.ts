import { UserRole } from '@prisma/client';

export type IRegisterUser = {
  email: string;
  password?: string;
  role?: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
};

export type ILoginUser = {
  email: string;
  password: string;
};

export type IGoogleLogin = {
  idToken: string;
  role?: UserRole;
};

export type IChangePassword = {
  oldPassword: string;
  newPassword: string;
};

export type ILoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    profile: {
      firstName: string;
      lastName: string;
      avatar: string | null;
      city: string | null;
    } | null;
  };
};
