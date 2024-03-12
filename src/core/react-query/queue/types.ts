import type { PaginationType } from '@/core/types/api';

export type QueueItemsInfiniteRequestType = {
  showAll?: boolean;
} & PaginationType;
