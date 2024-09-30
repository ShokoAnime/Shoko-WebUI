import { useMemo } from 'react';

import { useSettingsQuery } from '@/core/react-query/settings/queries';

import type { ImageType } from '@/core/types/api/common';
import type { EpisodeType } from '@/core/types/api/episode';

function useEpisodeThumbnail(
  episode: EpisodeType,
  backdrop: ImageType | undefined,
) {
  const { useThumbnailFallback } = useSettingsQuery().data.WebUI_Settings.collection.image;
  return useMemo(() => {
    if (episode.Images.Thumbnails.length) {
      return episode.Images.Thumbnails.find(image => image.Preferred) ?? episode.Images.Thumbnails[0];
    }

    if (episode.Images.Backdrops.length) {
      return episode.Images.Backdrops.find(image => image.Preferred) ?? episode.Images.Backdrops[0];
    }

    if (useThumbnailFallback && backdrop) return backdrop;
    return undefined;
  }, [episode, useThumbnailFallback, backdrop]);
}

export default useEpisodeThumbnail;
