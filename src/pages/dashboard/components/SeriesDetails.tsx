import React from 'react';
import { reduce } from 'lodash';

import SeriesPoster from '@/components/SeriesPoster';

import type { SeriesType } from '@/core/types/api/series';

type Props = {
  series: SeriesType;
};

const SeriesDetails = ({ series }: Props) => {
  const mainPoster = series.Images.Posters?.[0];
  const episodeCount = series.Size;
  const episodeText = `${episodeCount} ${episodeCount === 1 ? 'Episode' : 'Episodes'}`;
  const fileCount = reduce(series.Sizes.FileSources, (total, value) => total + value, 0);
  const fileText = `${fileCount} ${fileCount === 1 ? 'File' : 'Files'}`;
  const subtitle = episodeCount === fileCount ? episodeText : `${episodeText} | ${fileText}`;

  return (
    <SeriesPoster
      image={mainPoster}
      title={series.Name}
      subtitle={subtitle}
      shokoId={series.IDs.ID}
    />
  );
};

export default SeriesDetails;
