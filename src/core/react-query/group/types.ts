import type { PaginationType } from '@/core/types/api';

export type GroupsInfiniteRequestType = {
  randomImages?: boolean;
  startsWith?: string;
  topLevelOnly?: boolean;
  includeEmpty?: boolean;
} & PaginationType;
