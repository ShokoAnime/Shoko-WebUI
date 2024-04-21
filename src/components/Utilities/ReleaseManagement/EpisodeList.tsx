import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { useSeriesEpisodesWithMultipleReleases } from '@/core/react-query/release-management/queries';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { UtilityHeaderType } from '@/components/Utilities/constants';
import type { EpisodeType } from '@/core/types/api/episode';

const columns: UtilityHeaderType<EpisodeType>[] = [
  {
    id: 'episode',
    name: 'Episode Name',
    className: 'line-clamp-1 grow basis-0 overflow-hidden',
    item: episode => `${episode.AniDB?.EpisodeNumber} - ${episode.Name}`,
  },
  {
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
  },
];

const EpisodeList = ({ seriesId }: { seriesId: number }) => {
  const navigate = useNavigate();
  const episodesQuery = useSeriesEpisodesWithMultipleReleases(
    seriesId,
    { includeDataFrom: ['AniDB'], includeAbsolutePaths: true, pageSize: 25 },
    seriesId > 0,
  );
  const [episodes, episodeCount] = useFlattenListResult(episodesQuery.data);

  return (
    <div className="flex w-1/2 overflow-y-auto rounded-md border border-panel-border bg-panel-background p-6">
      {seriesId === 0 && <div className="m-auto text-lg font-semibold">Select Series to Populate</div>}

      {seriesId > 0 && episodesQuery.isPending && (
        <div className="flex grow items-center justify-center text-panel-text-primary">
          <Icon path={mdiLoading} size={4} spin />
        </div>
      )}

      {seriesId > 0 && episodesQuery.isSuccess && episodeCount > 0 && (
        <UtilitiesTable
          columns={columns}
          count={episodeCount}
          fetchNextPage={episodesQuery.fetchNextPage}
          isFetchingNextPage={episodesQuery.isFetchingNextPage}
          rows={episodes}
          skipSort
          handleRowSelect={(id, _) =>
            navigate('episode', { state: { episode: episodes.filter(episode => episode.IDs.ID === id)[0] } })}
          rowSelection={{}}
        />
      )}
    </div>
  );
};

export default EpisodeList;
