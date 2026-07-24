import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { mdiLoading, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { flatMap } from 'lodash';
import { useToggle } from 'usehooks-ts';

import ShokoIcon from '@/components/ShokoIcon';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { resetQueries } from '@/core/react-query/queryClient';
import {
  useReleaseManagementSeries,
  useReleaseManagementSeriesEpisodes,
} from '@/core/react-query/release-management/queries';
import { getAnidbAnimeLink, getAnidbEpisodeLink } from '@/core/util';
import { getEpisodePrefix } from '@/core/utilities/getEpisodePrefix';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useRowSelection from '@/hooks/useRowSelection';

import DuplicateFilesModal from './DuplicateFiles/DuplicateFilesModal';

import type { UtilityHeaderType } from '@/components/Utilities/constants';
import type { ReleaseManagementItemType } from '@/core/react-query/release-management/types';
import type { EpisodeType } from '@/core/types/api/episode';
import type { ReleaseManagementSeriesType } from '@/core/types/api/series';

const seriesColumns: UtilityHeaderType<ReleaseManagementSeriesType>[] = [
  {
    id: 'series',
    name: 'Series',
    className: 'grow basis-0 overflow-hidden',
    item: series => (
      <div className="flex items-center gap-x-1" data-tooltip-id="tooltip" data-tooltip-content={series.Name}>
        <span className="line-clamp-1">{series.Name}</span>
        <a
          href={getAnidbAnimeLink(series.IDs.AniDB)}
          target="_blank"
          rel="noreferrer noopener"
          className="cursor-pointer text-panel-text-primary"
          aria-label="Open AniDB series page"
          onClick={event =>
            event.stopPropagation()}
        >
          <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
            <div className="metadata-link-icon AniDB" />
            {series.IDs.AniDB}
            <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
          </div>
        </a>
        <span>|</span>
        <Link to={`/webui/collection/series/${series.IDs.ID}`}>
          <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
            <ShokoIcon className="size-6" />
            {series.IDs.ID}
            <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
          </div>
        </Link>
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
      <a
        href={getAnidbEpisodeLink(episode.IDs.AniDB)}
        target="_blank"
        rel="noreferrer noopener"
        className="cursor-pointer text-panel-text-primary"
        aria-label="Open AniDB episode page"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
          <div className="metadata-link-icon AniDB" />
          {episode.IDs.AniDB}
          <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
        </div>
      </a>
    </div>
  ),
};

const duplicatesEpisodeFileCountColumn: UtilityHeaderType<EpisodeType> = {
  id: 'duplicate-count',
  name: 'Duplicate Count',
  className: 'w-40',
  item: (episode) => {
    let count = flatMap(
      episode.Files,
      file => file.Locations,
    ).filter(location => !!location.AbsolutePath).length;
    count -= 1;
    return (
      <>
        <span className="text-panel-text-important">{count}</span>
        {count === 1 ? ' Duplicate' : ' Duplicates'}
      </>
    );
  },
};

type Props = {
  type: ReleaseManagementItemType;
  setSelectedEpisodes?: (episodes: EpisodeType[]) => void;
  setSelectedSeriesId?: (id: number) => void;
  setSeriesCount: (count: number) => void;
};

const UtilitySeriesList = (
  {
    setSelectedEpisodes,
    setSelectedSeriesId,
    setSeriesCount,
    type,
  }: Props,
) => {
  const [searchParams] = useSearchParams();
  const onlyCollecting = searchParams.get('onlyCollecting') === 'true';
  const onlyFinishedSeries = searchParams.get('onlyFinishedSeries') === 'true';

  const [selectedSeries, setSelectedSeries] = useState(0);

  const seriesQuery = useReleaseManagementSeries(
    type,
    { collecting: onlyCollecting, onlyFinishedSeries, pageSize: 50 },
  );
  const [series, seriesCount] = useFlattenListResult(seriesQuery.data);

  const episodesQuery = useReleaseManagementSeriesEpisodes(
    type,
    selectedSeries,
    {
      collecting: onlyCollecting,
      includeDataFrom: ['AniDB'],
      includeAbsolutePaths: true,
      pageSize: 50,
    },
    selectedSeries > 0,
  );
  const [episodes, episodeCount] = useFlattenListResult(episodesQuery.data);

  useEffect(() => () => {
    resetQueries(['release-management', 'series', 'episodes']);
  }, []);

  const [showEpisodeModal, toggleEpisodeModal, setEpisodeModal] = useToggle(false);
  const [selectedEpisode, setSelectedEpisode] = useState(-1);

  const {
    handleRowSelect,
    rowSelection,
    selectedRows,
    setRowSelection,
  } = useRowSelection(episodes);

  useEffect(() => {
    setSelectedEpisodes?.(selectedRows);
  }, [selectedRows, setSelectedEpisodes]);

  useEffect(() => {
    if (!episodeCount) setEpisodeModal(false);
  }, [episodeCount, setEpisodeModal]);

  const handleEpisodeSelect = (episodeId: number, select: boolean) => {
    if (type === 'MissingEpisodes') handleRowSelect(episodeId, select);
    else {
      setSelectedEpisode(episodes.findIndex(episode => episode.IDs.ID === episodeId));
      toggleEpisodeModal();
    }
  };

  const handleEpisodeChange = async (changeType: 'previous' | 'next') => {
    const targetIndex = changeType === 'previous' ? selectedEpisode - 1 : selectedEpisode + 1;

    if (episodesQuery.isFetchingNextPage || targetIndex < 0 || targetIndex >= episodeCount) return;

    // Fetch more pages if the target episode hasn't been loaded yet.
    if (episodes.length <= targetIndex) {
      await episodesQuery.fetchNextPage();
    }

    setSelectedEpisode(targetIndex);
  };

  useEffect(() => {
    setSelectedSeriesId?.(selectedSeries);
    setSeriesCount(seriesCount);
  }, [selectedSeries, seriesCount, setSelectedSeriesId, setSeriesCount]);

  const episodeColumns = [
    episodeNameColumn,
    type === 'MissingEpisodes'
      ? {
        id: 'selected-count',
        name: selectedRows.length > 0 ? `${selectedRows.length} Selected` : '',
        className: 'w-28 text-panel-text-important',
        item: () => <div />,
      }
      : duplicatesEpisodeFileCountColumn,
  ];

  const episode = episodes[selectedEpisode];
  const episodeName = episode?.Name
    ? `${getEpisodePrefix(episode.AniDB?.Type)}${episode.AniDB?.EpisodeNumber} - ${episode.Name}`
    : '';

  return (
    <>
      <div className="flex grow">
        <div className="flex w-1/2 overflow-y-auto rounded-md border border-panel-border bg-panel-background p-6">
          {!seriesQuery.isSuccess && (
            <div className="flex grow items-center justify-center text-panel-text-primary">
              <Icon path={mdiLoading} size={4} spin />
            </div>
          )}

          {seriesQuery.isSuccess && seriesCount === 0 && (
            <div className="flex grow items-center justify-center text-lg font-semibold">
              No series with
              {type === 'DuplicateFiles' && ' duplicate files!'}
              {type === 'MissingEpisodes' && ' missing episodes!'}
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
          {(!seriesQuery.isSuccess
            || selectedSeries === 0) && <div className="m-auto text-lg font-semibold">Select series to populate</div>}

          {seriesQuery.isSuccess && (
            <>
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
                  handleRowSelect={handleEpisodeSelect}
                  rowSelection={rowSelection}
                  setRowSelection={setRowSelection}
                />
              )}

              {selectedSeries > 0 && episodesQuery.isSuccess && episodeCount === 0 && (
                <div className="flex grow items-center justify-center">
                  {type !== 'MissingEpisodes'
                    ? (
                      <>
                        All&nbsp;
                        {type === 'DuplicateFiles' ? 'duplicates' : 'multiples'}
                        &nbsp;cleared!
                      </>
                    )
                    : 'No missing episodes for this series!'}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {type === 'DuplicateFiles' && (
        <DuplicateFilesModal
          onClose={toggleEpisodeModal}
          show={showEpisodeModal}
          files={episode?.Files ?? []}
          subheader={episodeName}
          count={episodeCount}
          index={selectedEpisode}
          onChange={(changeType) => {
            handleEpisodeChange(changeType).catch(console.error);
          }}
          isFetching={episodesQuery.isFetchingNextPage}
        />
      )}
    </>
  );
};

export default UtilitySeriesList;
