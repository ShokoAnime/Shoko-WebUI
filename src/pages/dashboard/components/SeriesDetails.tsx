import React, { type JSX } from 'react';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import useMainPoster from '@/hooks/useMainPoster';

import type { SeriesType } from '@/core/types/api/series';

function SeriesDetails(props: { series: SeriesType }): JSX.Element {
  const { series } = props;
  const mainPoster = useMainPoster(series);

  return (
    <div key={`series-${series.IDs.ID}`} className="mr-4 flex w-56 shrink-0 flex-col justify-center last:mr-0">
      <BackgroundImagePlaceholderDiv
        image={mainPoster}
        className="mb-3 h-80 rounded border border-panel-border drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
      />
      <p className="mb-1 truncate text-center text-sm font-semibold" title={series.Name}>{series.Name}</p>
      <p className="truncate text-center text-sm opacity-75" title={`${series.Size} Files`}>
        {series.Size}
        &nbsp;Files
      </p>
    </div>
  );
}

export default SeriesDetails;
