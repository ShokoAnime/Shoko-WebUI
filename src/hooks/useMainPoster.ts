import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

const useMainPoster = (target: SeriesType | CollectionGroupType) =>
  target?.Images?.Posters?.find(poster => poster.Preferred) ?? target?.Images?.Posters?.[0];

export default useMainPoster;
