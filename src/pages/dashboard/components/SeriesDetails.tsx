import React, { useMemo } from 'react';
import { reduce } from 'lodash';

import SeriesPoster from '@/components/SeriesPoster';
import useMainPoster from '@/hooks/useMainPoster';

import type { SeriesType } from '@/core/types/api/series';

type Props = {
  series: SeriesType;
};

const SeriesDetails = React.memo(({ series }: Props) => {
  const mainPoster = useMainPoster(series);

  const subtitle = useMemo(
    () => {
      const episodeCount = series.Size;
      const episodeText = `${episodeCount} ${episodeCount === 1 ? 'Episode' : 'Episodes'}`;
      const fileCount = reduce(series.Sizes.FileSources, (total, value) => total + value, 0);
      if (episodeCount === fileCount) {
        return episodeText;
      }

      const fileText = `${fileCount} ${fileCount === 1 ? 'File' : 'Files'}`;
      return `${episodeText} | ${fileText}`;
    },
    [series.Sizes, series.Size],
  );

  return (
    <SeriesPoster
      image={mainPoster}
      title={series.Name}
      subtitle={subtitle}
      shokoId={series.IDs.ID}
    />
  );
});

export default SeriesDetails;
