import React, { type JSX } from 'react';
import { Link } from 'react-router-dom';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import useMainPoster from '@/hooks/useMainPoster';

import type { SeriesType } from '@/core/types/api/series';

function SeriesDetails(props: { series: SeriesType }): JSX.Element {
  const { series } = props;
  const mainPoster = useMainPoster(series);

  return (
    <Link
      key={`series-${series.IDs.ID}`}
      className="group mr-4 flex w-56 shrink-0 flex-col justify-center last:mr-0"
      to={`/webui/collection/series/${series.IDs.ID}`}
    >
      <BackgroundImagePlaceholderDiv
        image={mainPoster}
        className="mb-3 h-80 rounded-md border border-panel-border drop-shadow-md"
        hidePlaceholderOnHover
        zoomOnHover
      >
        <div className="pointer-events-none z-50 flex h-full bg-panel-background-transparent p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100" />
      </BackgroundImagePlaceholderDiv>
      <p className="mb-1 truncate text-center text-sm font-semibold" title={series.Name}>{series.Name}</p>
      <p className="truncate text-center text-sm font-semibold opacity-65" title={`${series.Size} Files`}>
        {series.Size}
        &nbsp;
        {series.Size === 1 ? 'File' : 'Files'}
      </p>
    </Link>
  );
}

export default SeriesDetails;
