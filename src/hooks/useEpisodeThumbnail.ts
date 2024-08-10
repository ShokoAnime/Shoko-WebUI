import { useMemo } from 'react';

import { useSettingsQuery } from '@/core/react-query/settings/queries';

import type { ImageType } from '@/core/types/api/common';
import type { EpisodeType } from '@/core/types/api/episode';

function useEpisodeThumbnail(
  episode: EpisodeType,
  backdrop: ImageType | undefined,
): ImageType | null {
  const { useThumbnailFallback } = useSettingsQuery().data.WebUI_Settings.collection.image;
  return useMemo(() => {
    if (episode.TvDB?.[0]?.Thumbnail) return episode.TvDB[0].Thumbnail;
    if (useThumbnailFallback && backdrop) return backdrop;
    return null;
  }, [episode.TvDB, backdrop, useThumbnailFallback]);
}

export default useEpisodeThumbnail;
