import type { CollectionGroupType } from '@/core/types/api/collection';
import type { ImageType } from '@/core/types/api/common';
import type { SeriesType } from '@/core/types/api/series';

const useMainPoster = (target: SeriesType | CollectionGroupType): ImageType | null =>
  target?.Images?.Posters?.find(poster => poster.Preferred) ?? target?.Images?.Posters?.[0] ?? null;

export default useMainPoster;
