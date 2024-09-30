import { useMemo } from 'react';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

function useMainPoster(target: SeriesType | CollectionGroupType | null | undefined) {
  // There is only 1 poster in the series/collection and if preferred image exists, it will always be that.
  // So checking for preferred image is not needed.
  return useMemo(() => target?.Images?.Posters?.[0], [target]);
}

export default useMainPoster;
