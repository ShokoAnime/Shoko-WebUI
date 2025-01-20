import React, { useMemo } from 'react';

import SeriesPoster from '@/components/SeriesPoster';
import useMainPoster from '@/hooks/useMainPoster';

import type { SeriesType } from '@/core/types/api/series';

type Props = {
  series: SeriesType;
};

const SeriesDetails = React.memo(({ series }: Props) => {
  const mainPoster = useMainPoster(series);

  const fileCount = useMemo(
    () => `${series.Size} ${series.Size === 1 ? 'File' : 'Files'}`,
    [series.Size],
  );

  return (
    <SeriesPoster
      image={mainPoster}
      title={series.Name}
      subtitle={fileCount}
      anidbSeriesId={series.IDs.AniDB}
      shokoId={series.IDs.ID}
    />
  );
});

export default SeriesDetails;
