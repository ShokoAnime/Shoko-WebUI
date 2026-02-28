import type { PaginationType } from '@/core/types/api';
import type { DataSourceType } from '@/core/types/api/common';
import type { CreateOrUpdateFilterType } from '@/core/types/api/filter';

export type FilteredGroupsRequestType = {
  randomImages?: boolean;
  filterCriteria: CreateOrUpdateFilterType;
  includeEmpty?: boolean;
} & PaginationType;

export type FilteredGroupSeriesRequestType = {
  randomImages?: boolean;
  filterCriteria: CreateOrUpdateFilterType;
  includeDataFrom?: DataSourceType[];
  recursive?: boolean;
  includeMissing?: boolean;
};

export type FilteredSeriesRequestType = {
  randomImages?: boolean;
  filterCriteria: CreateOrUpdateFilterType;
  includeMissing?: boolean;
} & PaginationType;
