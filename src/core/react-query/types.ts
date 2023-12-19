import type { PaginationType } from '@/core/types/api';
import type { DataSourceType } from '@/core/types/api/common';
import type { FileSortCriteriaEnum } from '@/core/types/api/file';

type FileIncludeType = 'Ignored' | 'MediaInfo' | 'XRefs' | 'AbsolutePaths';
type FileExcludeType = 'Watched' | 'Duplicates' | 'Unrecognized' | 'ManualLinks';
type FileIncludeOnlyType = 'Watched' | 'Variations' | 'Duplicates' | 'Unrecognized' | 'ManualLinks' | 'Ignored';

export type FileRequestType = {
  include?: FileIncludeType[];
  exclude?: FileExcludeType[];
  include_only?: FileIncludeOnlyType[];
  includeDataFrom?: DataSourceType[];
  sortOrder?: FileSortCriteriaEnum[];
} & PaginationType;

export type DashboardRequestType = {
  includeRestricted?: boolean;
} & PaginationType;
