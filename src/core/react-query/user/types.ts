import type { CommunitySitesType } from '@/core/types/api/user';

export type ChangePasswordRequestType = {
  Password: string;
  RevokeAPIKeys: boolean;
  userId?: number;
};

export type CreateUserRequestType = {
  Username?: string;
  IsAdmin?: boolean;
  CommunitySites?: CommunitySitesType[];
  RestrictedTags?: number[];
  Avatar?: string | null;
  PlexUsernames?: string;
  Password?: string;
};
