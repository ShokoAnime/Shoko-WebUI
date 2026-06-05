import type { PaginationType } from '@/core/types/api';
import type { FileSortCriteriaEnum } from '@/core/types/api/file';

export type IncludeOnlyFilterType = 'true' | 'false' | 'only';

type FileIncludeType =
  | 'Ignored'
  | 'MediaInfo'
  | 'ReleaseInfo'
  | 'XRefs'
  | 'AbsolutePaths'
  | 'ImportLimbo'
  | 'LocationUIDs';
type FileExcludeType =
  | 'Watched'
  | 'Duplicates'
  | 'Unrecognized'
  | 'ManualLinks'
  | 'Variations';
type FileIncludeOnlyType =
  | 'Watched'
  | 'Variations'
  | 'Duplicates'
  | 'Unrecognized'
  | 'ManualLinks'
  | 'Ignored'
  | 'ImportLimbo';

export type FileRequestType = {
  include?: FileIncludeType[];
  exclude?: FileExcludeType[];
  include_only?: FileIncludeOnlyType[];
  sortOrder?: FileSortCriteriaEnum[];
} & PaginationType;

export type DashboardRequestType = {
  includeRestricted?: boolean;
} & PaginationType;
