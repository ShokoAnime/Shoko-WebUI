import type { PaginationType } from '@/core/types/api';
import type { Operation } from 'fast-json-patch';

export type GroupsInfiniteRequestType = {
  randomImages?: boolean;
  startsWith?: string;
  topLevelOnly?: boolean;
  includeEmpty?: boolean;
} & PaginationType;

export type PatchGroupRequestType = {
  groupId: number;
  seriesId: number;
  operations: Operation[];
};

export type MoveSeriesGroupRequestType = {
  seriesId: number;
  groupId: number;
};

export type GroupSeriesRequestType = {
  groupId: number;
  enabled?: boolean;
  sorted?: boolean;
};
