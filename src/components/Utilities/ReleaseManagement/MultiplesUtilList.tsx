import React, { useEffect, useState } from 'react';
import { mdiLoading, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';

import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import {
  useSeriesEpisodesWithMultipleReleases,
  useSeriesWithMultipleReleases,
} from '@/core/react-query/release-management/queries';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { UtilityHeaderType } from '@/components/Utilities/constants';
import type { EpisodeType } from '@/core/types/api/episode';
import type { SeriesWithMultipleReleasesType } from '@/core/types/api/series';

const columns: UtilityHeaderType<SeriesWithMultipleReleasesType>[] = [
  {
    id: 'series',
    name: 'Series (AniDB ID)',
    className: 'grow basis-0 overflow-hidden',
    item: series => (
      <div title={series.Name} className="flex items-center gap-x-1">
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

type Props = {
  ignoreVariations: boolean;
  onlyFinishedSeries: boolean;
  setSelectedEpisode: (episode: EpisodeType) => void;
  setSeriesCount: (count: number) => void;
};

const MultiplesUtilList = ({ ignoreVariations, onlyFinishedSeries, setSelectedEpisode, setSeriesCount }: Props) => {
  const [selectedSeries, setSelectedSeries] = useState(0);

  const seriesQuery = useSeriesWithMultipleReleases({ ignoreVariations, onlyFinishedSeries, pageSize: 25 });
  const [series, seriesCount] = useFlattenListResult(seriesQuery.data);

  const episodesQuery = useSeriesEpisodesWithMultipleReleases(
    selectedSeries,
    { ignoreVariations, includeDataFrom: ['AniDB'], includeAbsolutePaths: true, pageSize: 25 },
    selectedSeries > 0,
  );
  const [episodes, episodeCount] = useFlattenListResult(episodesQuery.data);

  useEffect(() => {
    setSeriesCount(seriesCount);
  }, [seriesCount, setSeriesCount]);

  // Reset series selection if query data changes
  useEffect(() => {
    setSelectedSeries(0);
  }, [seriesQuery.data]);

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
            No series with multiple files!
          </div>
        )}

        {seriesQuery.isSuccess && seriesCount > 0 && (
          <UtilitiesTable
            columns={columns}
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
            columns={columns}
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

export default MultiplesUtilList;
