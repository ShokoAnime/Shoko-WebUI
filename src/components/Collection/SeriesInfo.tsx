import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

import { useGetSeriesQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { useGetSeriesOverviewQuery } from '@/core/rtkQuery/splitV3Api/webuiApi';
import { dayjs, formatThousand } from '@/core/util';

import type { SeriesDetailsType } from '@/core/types/api/series';
import type { WebuiSeriesDetailsType } from '@/core/types/api/webui';

const SeriesInfo = () => {
  const { seriesId } = useParams();

  // Series Data;
  const seriesOverviewData = useGetSeriesOverviewQuery({ SeriesID: seriesId! }, { skip: !seriesId });
  const overview = useMemo(() => seriesOverviewData?.data || {} as WebuiSeriesDetailsType, [seriesOverviewData]);
  const seriesData = useGetSeriesQuery({ seriesId: seriesId!, includeDataFrom: ['AniDB'] }, { skip: !seriesId });
  const series = useMemo(() => seriesData?.data ?? {} as SeriesDetailsType, [seriesData]);

  const startDate = useMemo(() => dayjs(series.AniDB?.AirDate), [series]);
  const endDate = useMemo(() => (series.AniDB?.EndDate !== null ? dayjs(series.AniDB?.EndDate) : null), [series]);
  const airDate = () => {
    if (endDate) {
      if (startDate.format('MMM DD, YYYY') === endDate.format('MMM DD, YYYY')) {
        return startDate.format('MMM DD, YYYY');
      }
      return `${startDate.format('MMM DD, YYYY')} - ${endDate.format('MMM DD, YYYY')}`;
    }
    return `${startDate.format('MMM DD, YYYY')} - Ongoing`;
  };

  return (
    <div className="flex w-full max-w-[31.25rem] flex-col gap-y-8">
      <div className="flex w-full flex-row justify-around gap-y-4 rounded-md border border-panel-border bg-panel-background-transparent p-8">
        <div className="flex flex-col items-center">
          <div className="font-semibold ">File Count</div>
          <div className="flex flex-row gap-x-1">
            <span>EP:</span>
            <span>{formatThousand(series.Sizes.Local.Episodes)}</span>
            {series.Sizes.Local.Specials !== 0 && (
              <>
                <span>|</span>
                <span>SP:</span>
                <span>{formatThousand(series.Sizes.Local.Specials)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="font-semibold ">Watched</div>
          <div className="flex flex-row gap-x-1">
            <span>EP:</span>
            <span>{formatThousand(series.Sizes.Watched.Episodes)}</span>
            {(series.Sizes.Total.Specials !== 0 && series.Sizes.Local.Specials !== 0) && (
              <>
                <span>|</span>
                <span>SP:</span>
                <span>{formatThousand(series.Sizes.Watched.Specials)}</span>
              </>
            )}
          </div>
        </div>

        {(series.Sizes.Total.Episodes - series.Sizes.Local.Episodes !== 0
          || series.Sizes.Total.Specials - series.Sizes.Local.Specials !== 0) && (
          <div className="flex flex-col items-center">
            <div className="font-semibold ">Missing</div>
            <div className="flex flex-row gap-x-1">
              {series.Sizes.Total.Episodes - series.Sizes.Local.Episodes !== 0 && (
                <>
                  <span>EP:</span>
                  <span>{formatThousand(series.Sizes.Total.Episodes - series.Sizes.Local.Episodes)}</span>
                </>
              )}
              {series.Sizes.Total.Episodes - series.Sizes.Local.Episodes !== 0
                && series.Sizes.Total.Specials - series.Sizes.Local.Specials !== 0
                && <span>|</span>}
              {series.Sizes.Total.Specials - series.Sizes.Local.Specials !== 0 && (
                <>
                  <span>SP:</span>
                  <span>{formatThousand(series.Sizes.Total.Specials - series.Sizes.Local.Specials)}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex w-full flex-col gap-y-3 rounded-md border border-panel-border bg-panel-background-transparent p-8">
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Type</div>
          {series.AniDB?.Type}
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Source</div>
          {overview.SourceMaterial}
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Air Date</div>
          <div>
            {airDate()}
          </div>
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Status</div>
          {/* TODO: Check if there are more status types */}
          {(series.AniDB?.EndDate && dayjs(series.AniDB.EndDate).isAfter(dayjs())) ? 'Ongoing' : 'Finished'}
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Episodes</div>
          <div>
            {series.Sizes.Total.Episodes}
            &nbsp;Episodes
            <span className="mx-1">|</span>
            {series.Sizes.Total.Specials}
            &nbsp;Specials
          </div>
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">Length</div>
          {/* TODO: Get episode length */}
          <div>-- Minutes/Episode</div>
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
    </div>
  );
};

export default SeriesInfo;
