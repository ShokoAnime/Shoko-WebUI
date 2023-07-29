import { useMemo } from 'react';

import { ImageType } from '@/core/types/api/common';
import { EpisodeType } from '@/core/types/api/episode';

function useEpisodeThumbnail(episode: EpisodeType): ImageType | null {
  return useMemo(() => episode.TvDB?.[0]?.Thumbnail ?? null, [episode]);
}

export default useEpisodeThumbnail;
