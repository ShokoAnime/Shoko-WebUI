import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { toNumber } from 'lodash';

import { useSeriesOverviewQuery } from '@/core/react-query/webui/queries';
import { convertTimeSpanToMs, dayjs, formatThousand } from '@/core/util';

import type { SeriesType } from '@/core/types/api/series';
import type { WebuiSeriesDetailsType } from '@/core/types/api/webui';

type SeriesInfoProps = {
  series: SeriesType;
};

const SeriesInfo = ({ series }: SeriesInfoProps) => {
  const { seriesId } = useParams();

  // Series Data;
  const seriesOverviewQuery = useSeriesOverviewQuery(toNumber(seriesId!), !!seriesId);
  const overview = seriesOverviewQuery?.data ?? {} as WebuiSeriesDetailsType;
  const startDate = useMemo(() => (series.AniDB?.AirDate != null ? dayjs(series.AniDB?.AirDate) : null), [series]);
  const endDate = useMemo(() => (series.AniDB?.EndDate != null ? dayjs(series.AniDB?.EndDate) : null), [series]);
  const airDate = useMemo(() => {
    if (!startDate) {
      return 'Unknown';
    }
    if (endDate) {
      if (startDate.format('MMM DD, YYYY') === endDate.format('MMM DD, YYYY')) {
        return startDate.format('MMM DD, YYYY');
      }
      return `${startDate.format('MMM DD, YYYY')} - ${endDate.format('MMM DD, YYYY')}`;
    }
    return `${startDate.format('MMM DD, YYYY')} - Ongoing`;
  }, [startDate, endDate]);

  const status = useMemo(() => {
    if (!startDate) {
      return 'Unknown';
    }
    if (endDate?.isAfter(dayjs())) {
      return 'Ongoing';
    }
    return 'Finished';
  }, [startDate, endDate]);

  if (!seriesId) return null;

  return (
    <div className="flex w-full flex-col gap-y-6">
      <div className="flex w-full border-b-2 border-panel-border pb-4 text-xl font-semibold">Series Information</div>
      <div className="flex w-full flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Type</div>
          {series?.AniDB?.Type}
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Source</div>
          {overview.SourceMaterial}
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Air Date</div>
          <div>
            {airDate}
          </div>
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Status</div>
          {/* TODO: Check if there are more status types */}
          {status}
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Episodes</div>
          <div>
            {series?.Sizes.Total.Episodes}
            &nbsp;Episodes
            <span className="mx-1">|</span>
            {series?.Sizes.Total.Specials}
            &nbsp;Specials
          </div>
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Length</div>
          {overview.RuntimeLength
            ? `${dayjs.duration(convertTimeSpanToMs(overview.RuntimeLength)).asMinutes()} Minutes/Episode`
            : '--'}
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Season</div>
          {overview?.FirstAirSeason
            ? (
              <Link
                className="font-semibold text-panel-text-primary"
                to={`/webui/collection/filter/${overview.FirstAirSeason.IDs.ID}`}
              >
                {overview.FirstAirSeason.Name}
              </Link>
            )
            : '--'}
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Studio</div>
          <div>{overview?.Studios?.[0] ? overview?.Studios?.[0].Name : 'Studio Not Listed'}</div>
        </div>
      </div>
      <div className="flex w-full border-b-2 border-panel-border pb-4 text-xl font-semibold">User Stats</div>
      <div className="flex w-full flex-col gap-y-1">
        <div className="flex justify-between">
          <div className="font-semibold ">File Count</div>
          <div className="flex flex-row gap-x-1">
            <span>{formatThousand(series.Sizes.Local.Episodes)}</span>
            <span>{series.Sizes.Local.Episodes > 1 || series.Sizes.Local.Episodes === 0 ? 'Episodes' : 'Episode'}</span>
            {series.Sizes.Local.Specials !== 0 && (
              <>
                <span>|</span>
                <span>{formatThousand(series.Sizes.Local.Specials)}</span>
                <span>
                  {series.Sizes.Local.Specials > 1 || series.Sizes.Local.Specials === 0 ? 'Specials' : 'Special'}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="font-semibold ">Watched</div>
          <div className="flex flex-row gap-x-1">
            <span>{formatThousand(series.Sizes.Watched.Episodes)}</span>
            <span>
              {series.Sizes.Watched.Episodes > 1 || series.Sizes.Watched.Episodes === 0 ? 'Episodes' : 'Episode'}
            </span>
            {(series.Sizes.Total.Specials !== 0 && series.Sizes.Watched.Specials !== 0) && (
              <>
                <span>|</span>
                <span>{formatThousand(series.Sizes.Watched.Specials)}</span>
                <span>
                  {series.Sizes.Watched.Specials > 1 || series.Sizes.Local.Specials === 0 ? 'Specials' : 'Special'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <div className="font-semibold ">Missing</div>
          {(series?.Sizes.Missing.Episodes !== 0 || series?.Sizes.Missing.Specials !== 0)
            ? (
              <div className="flex flex-row gap-x-1">
                {series?.Sizes.Missing.Episodes !== 0 && (
                  <>
                    <span>{formatThousand(series.Sizes.Missing.Episodes)}</span>
                    <span>
                      {series.Sizes.Missing.Episodes > 1 || series.Sizes.Missing.Episodes === 0
                        ? 'Episodes'
                        : 'Episode'}
                    </span>
                  </>
                )}
                {series.Sizes.Missing.Episodes !== 0 && series.Sizes.Missing.Specials !== 0 && <span>|</span>}
                {series.Sizes.Missing.Specials !== 0 && (
                  <>
                    <span>{formatThousand(series.Sizes.Missing.Specials)}</span>
                    <span>
                      {series.Sizes.Missing.Specials > 1 || series.Sizes.Missing.Episodes === 0
                        ? 'Specials'
                        : 'Special'}
                    </span>
                  </>
                )}
              </div>
            )
            : <div>None, Nice Work!</div>}
        </div>
        <div className="flex justify-between">
          <div className="font-semibold ">Series Rating</div>
          <div className="flex flex-row gap-x-1">
            N/A (Not Implemented Yet)
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesInfo;
