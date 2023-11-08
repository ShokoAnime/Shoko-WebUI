import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { mdiOpenInNew, mdiWeb } from '@mdi/js';
import { Icon } from '@mdi/react';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { useGetSeriesQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { useGetSeriesOverviewQuery } from '@/core/rtkQuery/splitV3Api/webuiApi';
import { dayjs } from '@/core/util';
import useMainPoster from '@/hooks/useMainPoster';
import SeriesMetadata from '@/pages/collection/series/SeriesMetadata';

import type { SeriesDetailsType } from '@/core/types/api/series';
import type { WebuiSeriesDetailsType } from '@/core/types/api/webui';

const SeriesInfo = () => {
  const { seriesId } = useParams();

  // Series Data
  const seriesOverviewData = useGetSeriesOverviewQuery({ SeriesID: seriesId! }, { skip: !seriesId });
  const overview = useMemo(() => seriesOverviewData?.data || {} as WebuiSeriesDetailsType, [seriesOverviewData]);
  const seriesData = useGetSeriesQuery({ seriesId: seriesId!, includeDataFrom: ['AniDB'] }, { skip: !seriesId });
  const series = useMemo(() => seriesData?.data ?? {} as SeriesDetailsType, [seriesData]);
  const mainPoster = useMainPoster(series);
  const [airDate, endDate] = useMemo(() => {
    const tempAirDate = dayjs(series.AniDB?.AirDate);
    const tempEndDate = dayjs(series.AniDB?.EndDate);
    return [tempAirDate, tempEndDate, series.AniDB?.EndDate ? tempEndDate.isAfter(dayjs()) : true];
  }, [series]);

  // Links
  const metadataLinks = ['AniDB', 'TMDB', 'TvDB', 'TraktTv'];

  return (
    <>
      <BackgroundImagePlaceholderDiv
        image={mainPoster}
        className="h-[23.875rem] w-[17.0625rem] rounded drop-shadow-md"
      />
      <div className="flex flex-col gap-y-4">
        <div className="text-xl font-semibold">
          Series Information
        </div>
        <div className="border-b-2 border-panel-border" />
        <div className="flex flex-col gap-y-1 capitalize">
          <div className="font-semibold">Source</div>
          {overview.SourceMaterial}
        </div>
        <div className="flex flex-col gap-y-1 capitalize">
          <div className="font-semibold">Type</div>
          {series.AniDB?.Type}
        </div>
        <div className="flex flex-col gap-y-1 capitalize">
          <div className="font-semibold">Air Date</div>
          {airDate.format('MMMM Do, YYYY')}
          {!airDate.isSame(endDate) && (
            <>
              &nbsp;-&nbsp;
              <span>{endDate.toString() === 'Invalid Date' ? 'Current' : endDate.format('MMMM Do, YYYY')}</span>
            </>
          )}
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="font-semibold">Episodes</div>
          <div>
            {series.Sizes.Total.Episodes}
            &nbsp;Episodes
          </div>
          <div>
            {series.Sizes.Total.Specials}
            &nbsp;Specials
          </div>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="font-semibold">Length</div>
          {/* TODO: Get episode length */}
          <div>-- Minutes/Episode</div>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="font-semibold">Status</div>
          {/* TODO: Check if there are more status types */}
          {(series.AniDB?.EndDate && dayjs(series.AniDB.EndDate).isAfter(dayjs())) ? 'Ongoing' : 'Finished'}
        </div>
        <div className="flex flex-col gap-y-1">
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
        <div className="flex flex-col gap-y-1">
          <div className="font-semibold">Studio</div>
          <div>{overview?.Studios?.[0] ? overview?.Studios?.[0].Name : 'Studio Not Listed'}</div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="text-xl font-semibold">
          Links
        </div>
        <div className="border-b-2 border-panel-border" />
        <div className="flex flex-col gap-y-2">
          {series?.Links.map(link => (
            (link.Type === 'source' || link.Type === 'wiki'
              || link.Type === 'english-metadata') && (
              <div
                key={link.Name}
                className="flex rounded border border-panel-border bg-panel-background-alt px-4 py-3"
              >
                <Icon className="text-panel-icon" path={mdiWeb} size={1} />
                <a
                  className="px-2 font-semibold text-panel-text-primary"
                  href={link.URL}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {link.Name}
                </a>
                <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
              </div>
            )
          ))}
          <div className="flex rounded border border-panel-border bg-panel-background-alt px-4 py-3">
            <div className="metadata-link-icon MAL" />
            <a
              href={`https://myanimelist.net/anime/${series.IDs.MAL[0]}`}
              className="px-2 font-semibold text-panel-text-primary"
              rel="noopener noreferrer"
              target="_blank"
            >
              My Anime List
            </a>
            <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="text-xl font-semibold">
          Metadata Sources
        </div>
        <div className="border-b-2 border-panel-border" />
        <div className="flex flex-col gap-y-2">
          {metadataLinks.map(site => (
            <div className="rounded border border-panel-border bg-panel-background-alt px-4 py-3" key={site}>
              <SeriesMetadata site={site} id={series.IDs[site]} series={series.Name} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SeriesInfo;
