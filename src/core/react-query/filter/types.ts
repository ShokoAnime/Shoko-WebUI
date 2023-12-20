import type { PaginationType } from '@/core/types/api';
import type { FilterType } from '@/core/types/api/filter';

export type FilteredGroupsRequestType = {
  randomImages?: boolean;
  filterCriteria: FilterType;
} & PaginationType;

export type FilteredGroupSeriesRequestType = {
  randomImages?: boolean;
  filterCriteria: FilterType;
};
