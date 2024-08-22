import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { toNumber } from 'lodash';

import { useSeriesOverviewQuery } from '@/core/react-query/webui/queries';
import { convertTimeSpanToMs, dayjs } from '@/core/util';

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
      if (startDate.format('MMM DD/YY') === endDate.format('MMM DD/YY')) {
        return startDate.format('MMM DD/YY');
      }
      return `${startDate.format('MMM DD/YY')} - ${endDate.format('MMM DD/YY')}`;
    }
    return `${startDate.format('MMM DD/YY')} - Ongoing`;
  }, [startDate, endDate]);

  const status = useMemo(() => {
    if (!startDate) {
      return 'Unknown';
    }
    if (!endDate || endDate.isAfter(dayjs())) {
      return 'Currently Airing';
    }
    return 'Finished';
  }, [startDate, endDate]);

  if (!seriesId) return null;

  return (
    <>
      <div className="flex w-full flex-col gap-y-2">
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Type</div>
          <div className="truncate">
            &nbsp;
            {series?.AniDB?.Type}
          </div>
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Source</div>
          <div className="truncate">
            &nbsp;
            {overview.SourceMaterial}
          </div>
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Airdate</div>
          <div className="truncate">
            &nbsp;
            {airDate}
          </div>
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Status</div>
          {/* TODO: Check if there are more status types */}
          <div className="truncate">
            &nbsp;
            {status}
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-y-2">
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Episodes</div>
          <div className="truncate">
            &nbsp;
            {series?.Sizes.Total.Episodes}
            &nbsp;
            {series?.Sizes.Total.Episodes > 1
              ? 'Eps'
              : 'Ep'}
            <span className="mx-1">|</span>
            {series?.Sizes.Total.Specials}
            &nbsp;
            {series?.Sizes.Total.Episodes > 1
              ? 'Sps'
              : 'Sp'}
          </div>
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Length</div>
          <div className="truncate">
            &nbsp;
            {overview.RuntimeLength
              ? `${dayjs.duration(convertTimeSpanToMs(overview.RuntimeLength)).asMinutes()} Min/Ep`
              : '--'}
          </div>
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Season</div>
          <div className="truncate">
            &nbsp;
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
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Studio</div>
          <div className="truncate">
            &nbsp;
            {overview?.Studios?.[0]
              ? overview?.Studios?.[0].Name
              : 'Studio Not Listed'}
          </div>
        </div>
      </div>
    </>
  );
};

export default SeriesInfo;
