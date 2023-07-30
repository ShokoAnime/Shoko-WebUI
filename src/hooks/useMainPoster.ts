import { useMemo } from 'react';

import { CollectionGroupType } from '@/core/types/api/collection';
import { ImageType } from '@/core/types/api/common';
import { SeriesType } from '@/core/types/api/series';

function useMainPoster(target: SeriesType | CollectionGroupType): ImageType | null {
  return useMemo(() => {
    const posters = target?.Images?.Posters ?? [];
    return posters.find(poster => poster.Preferred) ?? posters[0] ?? null;
  }, [target]);
}

export default useMainPoster;
