import React from 'react';
import { Link } from 'react-router';

import SeriesRating from '@/components/Collection/Series/SeriesRating';
import { formatThousand } from '@/core/util';

import type { SeriesType } from '@/core/types/api/series';

type SeriesInfoProps = {
  series: SeriesType;
};

const SeriesUserStats = React.memo(({ series }: SeriesInfoProps) => (
  <div className="flex flex-col gap-y-2">
    <div className="flex justify-between">
      <div className="font-semibold">File Count</div>
      <div className="flex flex-row gap-x-1 font-normal">
        <span>{formatThousand(series.Sizes.Local.Episodes)}</span>
        <span>
          {series.Sizes.Local.Episodes !== 1 ? 'Episodes' : 'Episode'}
        </span>
        {series.Sizes.Local.Specials > 0 && (
          <>
            <span>|</span>
            <span>{formatThousand(series.Sizes.Local.Specials)}</span>
            <span>
              {series.Sizes.Local.Specials !== 1 ? 'Specials' : 'Special'}
            </span>
          </>
        )}
      </div>
    </div>

    <div className="flex justify-between">
      <div className="font-semibold">Watched</div>
      <div className="flex flex-row gap-x-1 font-normal">
        <span>{formatThousand(series.Sizes.Watched.Episodes)}</span>
        <span>
          {series.Sizes.Watched.Episodes !== 1 ? 'Episodes' : 'Episode'}
        </span>
        {series.Sizes.Total.Specials > 0 && series.Sizes.Watched.Specials > 0 && (
          <>
            <span>|</span>
            <span>{formatThousand(series.Sizes.Watched.Specials)}</span>
            <span>
              {series.Sizes.Watched.Specials !== 1 ? 'Specials' : 'Special'}
            </span>
          </>
        )}
      </div>
    </div>

    <div className="flex justify-between">
      <div className="font-semibold">Missing</div>
      {(series.Sizes.Missing.Episodes > 0 || series.Sizes.Missing.Specials > 0)
        ? (
          <div className="flex gap-x-1">
            {series.Sizes.Missing.Episodes > 0 && (
              <Link
                to="episodes?type=Normal&includeMissing=only&includeUnaired=false"
                className="text-panel-text-primary"
              >
                {formatThousand(series.Sizes.Missing.Episodes)}
                &nbsp;
                {series.Sizes.Missing.Episodes !== 1 ? 'Episodes' : 'Episode'}
              </Link>
            )}
            {series.Sizes.Missing.Episodes > 0 && series.Sizes.Missing.Specials > 0 && <span>|</span>}
            {series.Sizes.Missing.Specials > 0 && (
              <Link
                to="episodes?type=Special&includeMissing=only&includeUnaired=false"
                className="text-panel-text-primary"
              >
                {formatThousand(series.Sizes.Missing.Specials)}
                &nbsp;
                {series.Sizes.Missing.Specials !== 1 ? 'Specials' : 'Special'}
              </Link>
            )}
          </div>
        )
        : <div>None, Nice Work!</div>}
    </div>

    <div className="flex items-center justify-between">
      <div className="font-semibold ">
        Series Rating&nbsp;
        {series.UserRating?.Type === 'Temporary' && '(Temp)'}
      </div>
      <SeriesRating seriesId={series.IDs.ID} ratingValue={series.UserRating?.Value ?? 0} />
    </div>
  </div>
));

export default SeriesUserStats;
