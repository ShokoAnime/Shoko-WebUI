import { useMemo } from 'react';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { ImageType } from '@/core/types/api/common';
import type { SeriesType } from '@/core/types/api/series';

function useMainPoster(target: SeriesType | CollectionGroupType | null | undefined): ImageType | null {
  return useMemo(() => {
    const posters = target?.Images?.Posters ?? [];
    return posters.find(poster => poster.Preferred) ?? posters[0] ?? null;
  }, [target]);
}

export default useMainPoster;
