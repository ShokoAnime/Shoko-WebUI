import React, { useEffect, useMemo, useState } from 'react';
import { mdiLoading, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { forEach } from 'lodash';

import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import {
  useReleaseManagementSeries,
  useReleaseManagementSeriesEpisodes,
} from '@/core/react-query/release-management/queries';
import { getEpisodePrefix } from '@/core/utilities/getEpisodePrefix';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { UtilityHeaderType } from '@/components/Utilities/constants';
import type { EpisodeType } from '@/core/types/api/episode';
import type { ReleaseManagementSeriesType } from '@/core/types/api/series';

const seriesColumns: UtilityHeaderType<ReleaseManagementSeriesType>[] = [
  {
    id: 'series',
    name: 'Series (AniDB ID)',
    className: 'grow basis-0 overflow-hidden',
    item: series => (
      <div className="flex items-center gap-x-1" data-tooltip-id="tooltip" data-tooltip-content={series.Name}>
        <span className="line-clamp-1">{series.Name}</span>
        <div>
          (
          <span className="text-panel-text-primary">{series.IDs.AniDB}</span>
          )
        </div>
        <a
          href={`https://anidb.net/anime/${series.IDs.AniDB}`}
          target="_blank"
          rel="noreferrer noopener"
          className="cursor-pointer text-panel-text-primary"
          aria-label="Open AniDB series page"
          onClick={event =>
            event.stopPropagation()}
        >
          <Icon path={mdiOpenInNew} size={1} />
        </a>
      </div>
    ),
  },
  {
    id: 'entry-count',
    name: 'Entry Count',
    className: 'w-32',
    item: (series) => {
      const count = series.EpisodeCount;
      return (
        <>
          <span className="text-panel-text-important">{count}</span>
          {count === 1 ? ' Entry' : ' Entries'}
        </>
      );
    },
  },
];

const episodeNameColumn: UtilityHeaderType<EpisodeType> = {
  id: 'episode',
  name: 'Episode Name',
  className: 'line-clamp-1 grow basis-0 overflow-hidden',
  item: episode => (
    <div
      className="flex items-center gap-x-1"
      data-tooltip-id="tooltip"
      data-tooltip-content={episode.Name}
    >
      <span className="line-clamp-1">
        {getEpisodePrefix(episode.AniDB?.Type)}
        {episode.AniDB?.EpisodeNumber}
        &nbsp;-&nbsp;
        {episode.Name}
      </span>
      <div>
        (
        <span className="text-panel-text-primary">{episode.IDs.AniDB}</span>
        )
      </div>
      <a
        href={`https://anidb.net/episode/${episode.IDs.AniDB}`}
        target="_blank"
        rel="noreferrer noopener"
        className="cursor-pointer text-panel-text-primary"
        aria-label="Open AniDB episode page"
        onClick={event => event.stopPropagation()}
      >
        <Icon path={mdiOpenInNew} size={1} />
      </a>
    </div>
  ),
};

const multiplesEpisodeFileCountColumn: UtilityHeaderType<EpisodeType> = {
  id: 'file-count',
  name: 'File Count',
  className: 'w-28',
  item: (episode) => {
    const count = episode.Files?.length ?? 0;
    return (
      <>
        <span className="text-panel-text-important">{count}</span>
        {count === 1 ? ' File' : ' Files'}
      </>
    );
  },
};

const duplicatesEpisodeFileCountColumn: UtilityHeaderType<EpisodeType> = {
  id: 'duplicate-count',
  name: 'Duplicate Count',
  className: 'w-40',
  item: (episode) => {
    let count = 0;
    forEach(episode.Files, (file) => {
      if (file.Locations.length > 1) count += 1;
    });
    return (
      <>
        <span className="text-panel-text-important">{count}</span>
        {count === 1 ? ' Duplicate' : ' Duplicates'}
      </>
    );
  },
};

type Props = {
  type: 'multiples' | 'duplicates';
  ignoreVariations: boolean;
  onlyFinishedSeries: boolean;
  setSelectedEpisode: (episode: EpisodeType) => void;
  setSelectedSeriesId: (id: number) => void;
  setSeriesCount: (count: number) => void;
};

const SeriesList = (
  { ignoreVariations, onlyFinishedSeries, setSelectedEpisode, setSelectedSeriesId, setSeriesCount, type }: Props,
) => {
  const [selectedSeries, setSelectedSeries] = useState(0);

  const seriesQuery = useReleaseManagementSeries(type, { ignoreVariations, onlyFinishedSeries, pageSize: 25 });
  const [series, seriesCount] = useFlattenListResult(seriesQuery.data);

  const episodesQuery = useReleaseManagementSeriesEpisodes(
    type,
    selectedSeries,
    { ignoreVariations, includeDataFrom: ['AniDB'], includeAbsolutePaths: true, pageSize: 25 },
    selectedSeries > 0,
  );
  const [episodes, episodeCount] = useFlattenListResult(episodesQuery.data);

  useEffect(() => {
    setSelectedSeriesId(selectedSeries);
    setSeriesCount(seriesCount);
  }, [selectedSeries, seriesCount, setSelectedSeriesId, setSeriesCount]);

  // Reset series selection if query data changes
  useEffect(() => {
    setSelectedSeries(0);
  }, [seriesQuery.data]);

  const episodeColumns = useMemo(() => [
    episodeNameColumn,
    type === 'multiples' ? multiplesEpisodeFileCountColumn : duplicatesEpisodeFileCountColumn,
  ], [type]);

  return (
    <>
      <div className="flex w-1/2 overflow-y-auto rounded-md border border-panel-border bg-panel-background p-6">
        {seriesQuery.isPending && (
          <div className="flex grow items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}

        {!seriesQuery.isPending && seriesCount === 0 && (
          <div className="flex grow items-center justify-center text-lg font-semibold">
            No series with
            {type === 'multiples' ? ' multiple releases!' : ' duplicate files!'}
          </div>
        )}

        {seriesQuery.isSuccess && seriesCount > 0 && (
          <UtilitiesTable
            columns={seriesColumns}
            count={seriesCount}
            fetchNextPage={seriesQuery.fetchNextPage}
            isFetchingNextPage={seriesQuery.isFetchingNextPage}
            rows={series}
            skipSort
            handleRowSelect={(id, _) => setSelectedSeries(id)}
            rowSelection={{ [selectedSeries]: true }}
          />
        )}
      </div>

      <div className="flex w-1/2 overflow-y-auto rounded-md border border-panel-border bg-panel-background p-6">
        {selectedSeries === 0 && <div className="m-auto text-lg font-semibold">Select Series to Populate</div>}

        {selectedSeries > 0 && episodesQuery.isPending && (
          <div className="flex grow items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}

        {selectedSeries > 0 && episodesQuery.isSuccess && episodeCount > 0 && (
          <UtilitiesTable
            columns={episodeColumns}
            count={episodeCount}
            fetchNextPage={episodesQuery.fetchNextPage}
            isFetchingNextPage={episodesQuery.isFetchingNextPage}
            rows={episodes}
            skipSort
            handleRowSelect={(id, _) => setSelectedEpisode(episodes.filter(episode => episode.IDs.ID === id)[0])}
            rowSelection={{}}
          />
        )}
      </div>
    </>
  );
};

export default SeriesList;
