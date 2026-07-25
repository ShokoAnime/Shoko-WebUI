import type { PaginationType } from '@/core/types/api';
import type { CrossReferenceImageType } from '@/core/types/api/image';

export type SeriesImageCrossReferencesRequestType = {
  imageType: string;
  isAvailable?: boolean;
} & PaginationType;

export type UploadSeriesImageRequestType = {
  file: File;
  imageType: CrossReferenceImageType;
  seriesId: number;
};

export type AddImageCrossReferenceRequestType = {
  ImageType: CrossReferenceImageType;
  /** UUID of the uploaded image (from the Upload response). */
  ImageID: string;
};
