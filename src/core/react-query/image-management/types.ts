import type { PaginationType } from '@/core/types/api';
import type { ImageEntityType } from '@/core/types/api/common';

export type SeriesImageCrossReferencesRequestType = {
  imageType: ImageEntityType;
  isAvailable?: boolean;
} & PaginationType;
