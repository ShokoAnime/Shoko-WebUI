import React from 'react';

import { SeriesType } from '../../../core/types/api/series';
import BackgroundImagePlaceholderDiv from '../../../components/BackgroundImagePlaceholderDiv';

function SeriesDetails(props: { series: SeriesType }): JSX.Element {
  const { series } = props;
  const { ID: seriesImageID, Source: seriesImageSource } = series.Images.Posters[0];

  return (
    <div key={`series-${series.IDs.ID}`} className="mr-4 last:mr-0 shrink-0 w-56 justify-center flex flex-col">
      <BackgroundImagePlaceholderDiv imageSrc={`/api/v3/Image/${seriesImageSource}/Poster/${seriesImageID}`} className="relative h-80 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-background-border mb-3" />
      <p className="truncate text-center text-sm font-semibold mb-1" title={series.Name}>{series.Name}</p>
      <p className="truncate text-center text-sm opacity-75" title={`${series.Size} Files`}>{series.Size} Files</p>
    </div>
  );
}

export default SeriesDetails;
