import type { PaginationType } from '@/core/types/api';

export type SeriesImageCrossReferencesRequestType = {
  imageType: string;
  isAvailable?: boolean;
} & PaginationType;
