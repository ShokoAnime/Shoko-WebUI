import type { PaginationType } from '@/core/types/api';

export type QueueOperationRequestType = {
  operation: string;
  queue?: string;
};

export type QueueItemsInfiniteRequestType = {
  showAll?: boolean;
} & PaginationType;
