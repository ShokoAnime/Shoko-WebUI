import type { PaginationType } from '@/core/types/api';

export type TagsRequestType = {
  excludeDescriptions?: boolean;
} & PaginationType;
