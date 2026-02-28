import type { ApiUserType } from '@/core/types/api/user';

export type ChangePasswordRequestType = {
  Password: string;
  RevokeAPIKeys: boolean;
  userId?: number;
};

export type CreateUserRequestType = Partial<Omit<ApiUserType, 'ID'>>;
