import React from 'react';

import { SeriesType } from '../../../core/types/api/series';

function SeriesDetails(props: { series: SeriesType }): JSX.Element {
  const { series } = props;
  const { ID: seriesImageID, Source: seriesImageSource } = series.Images.Posters[0];

  return (
    <div key={`series-${series.IDs.ID}`} className="mr-5 last:mr-0 shrink-0 w-56 font-open-sans justify-center flex flex-col">
      <div style={{ background: `center / cover no-repeat url('/api/v3/Image/${seriesImageSource}/Poster/${seriesImageID}')` }} className="relative h-80 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-background-border mb-2" />
        <p className="truncate text-center text-base font-semibold" title={series.Name}>{series.Name}</p>
        <p className="truncate text-center text-sm" title={`${series.Size} Files`}>{series.Size} Files</p>
    </div>
  );
}

export default SeriesDetails;
