import type { PaginationType } from '@/core/types/api';

export type TagsRequestType = {
  excludeDescriptions?: boolean;
  includeCount?: boolean;
} & PaginationType;

export type CreateUserTagRequestType = {
  name: string;
  description?: string | null;
};

export type UpdateUserTagRequestType = {
  tagId: number;
  name?: string | null;
  description?: string | null;
};

export type AddRemoveUserTagRequestType = {
  tagId: number;
  seriesId: number;
};
