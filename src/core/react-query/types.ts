import type { PaginationType } from '@/core/types/api';
import type { FileSortOrderValue } from '@/core/types/api/file';

export type IncludeOnlyFilterType = 'true' | 'false' | 'only';

type FileIncludeValues =
  | 'Ignored'
  | 'MediaInfo'
  | 'ReleaseInfo'
  | 'XRefs'
  | 'AbsolutePaths'
  | 'ImportLimbo'
  | 'LocationUIDs';
type FileExcludeValues =
  | 'Watched'
  | 'Duplicates'
  | 'Unrecognized'
  | 'ManualLinks'
  | 'Variations';
type FileIncludeOnlyValues =
  | 'Watched'
  | 'Variations'
  | 'Duplicates'
  | 'Unrecognized'
  | 'ManualLinks'
  | 'Ignored'
  | 'ImportLimbo';

export type FileRequestType = {
  include?: FileIncludeValues[];
  exclude?: FileExcludeValues[];
  include_only?: FileIncludeOnlyValues[];
  sortOrder?: FileSortOrderValue[];
} & PaginationType;

export type DashboardRequestType = {
  includeRestricted?: boolean;
} & PaginationType;
