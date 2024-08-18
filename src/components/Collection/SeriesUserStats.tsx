import React, { useMemo } from 'react';

import SeriesRating from '@/components/Collection/Series/SeriesRating';
import { formatThousand } from '@/core/util';

import type { SeriesType } from '@/core/types/api/series';

type SeriesInfoProps = {
  series: SeriesType;
};

const SeriesUserStats = React.memo(({ series }: SeriesInfoProps) => {
  const userRating = useMemo(() => {
    if (!series.UserRating) return 0;
    const multiplier = 10 / series.UserRating.MaxValue;
    return series.UserRating.Value * multiplier;
  }, [series.UserRating]);

  return (
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
            <div className="flex flex-row gap-x-1 font-normal">
              {series.Sizes.Missing.Episodes > 0 && (
                <>
                  <span>{formatThousand(series.Sizes.Missing.Episodes)}</span>
                  <span>
                    {series.Sizes.Missing.Episodes !== 1 ? 'Episodes' : 'Episode'}
                  </span>
                </>
              )}
              {series.Sizes.Missing.Episodes > 0 && series.Sizes.Missing.Specials > 0 && <span>|</span>}
              {series.Sizes.Missing.Specials > 0 && (
                <>
                  <span>{formatThousand(series.Sizes.Missing.Specials)}</span>
                  <span>
                    {series.Sizes.Missing.Specials !== 1 ? 'Specials' : 'Special'}
                  </span>
                </>
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
        <SeriesRating seriesId={series.IDs.ID} ratingValue={userRating} />
      </div>
    </div>
  );
});

export default SeriesUserStats;
