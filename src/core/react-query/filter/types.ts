import type { PaginationType } from '@/core/types/api';
import type { DataSourceType } from '@/core/types/api/common';
import type { FilterType } from '@/core/types/api/filter';

export type FilteredGroupsRequestType = {
  randomImages?: boolean;
  filterCriteria: FilterType;
  includeEmpty?: boolean;
} & PaginationType;

export type FilteredGroupSeriesRequestType = {
  randomImages?: boolean;
  filterCriteria: FilterType;
  includeDataFrom?: DataSourceType[];
  recursive?: boolean;
  includeMissing?: boolean;
};

export type FilteredSeriesRequestType = {
  randomImages?: boolean;
  filterCriteria: FilterType;
  includeMissing?: boolean;
} & PaginationType;
