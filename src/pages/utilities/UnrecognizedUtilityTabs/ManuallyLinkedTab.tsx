import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  mdiCloseCircleOutline,
  mdiDatabaseSearchOutline,
  mdiLinkOff,
  mdiLoading,
  mdiMagnify,
  mdiOpenInNew,
  mdiRefresh,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import { countBy, toNumber } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ShokoIcon from '@/components/ShokoIcon';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import ItemCount from '@/components/Utilities/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import Title from '@/components/Utilities/Unrecognized/Title';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { useDeleteFileLinkMutation, useRescanFileMutation } from '@/core/react-query/file/mutations';
import { resetQueries } from '@/core/react-query/queryClient';
import {
  useSeriesEpisodesInfiniteQuery,
  useSeriesWithLinkedFilesInfiniteQuery,
} from '@/core/react-query/series/queries';
import { IncludeOnlyFilterEnum } from '@/core/react-query/series/types';
import { getEpisodePrefix } from '@/core/utilities/getEpisodePrefix';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useRowSelection from '@/hooks/useRowSelection';

import type { UtilityHeaderType } from '@/components/Utilities/constants';
import type { EpisodeType } from '@/core/types/api/episode';
import type { SeriesType } from '@/core/types/api/series';
import type { Updater } from 'use-immer';

const seriesColumns: UtilityHeaderType<SeriesType>[] = [
  {
    id: 'series',
    name: 'Series',
    className: 'grow basis-0 overflow-hidden',
    item: series => (
      <div className="flex items-center gap-x-1" data-tooltip-id="tooltip" data-tooltip-content={series.Name}>
        <span className="line-clamp-1">{series.Name}</span>
        <a
          href={`https://anidb.net/anime/${series.IDs.AniDB}`}
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
    id: 'link-count',
    name: 'Link Count',
    className: 'w-32',
    item: (series) => {
      const count = series.Sizes.FileSources.Unknown;
      return `${count} ${count === 1 ? 'File' : 'Files'}`;
    },
  },
];

const episodeColumns: UtilityHeaderType<EpisodeType>[] = [
  {
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
          href={`https://anidb.net/episode/${episode.IDs.AniDB}`}
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

const Menu = React.memo((props: { selectedFileIds: number[], setSelectedRows: Updater<Record<number, boolean>> }) => {
  const { selectedFileIds, setSelectedRows } = props;

  const { mutateAsync: rescanFile } = useRescanFileMutation();

  const rescanFiles = useEventCallback(() => {
    const promises = selectedFileIds.map(fileId => rescanFile(fileId));

    Promise
      .allSettled(promises)
      .then((result) => {
        const failedCount = countBy(result, 'status').rejected;
        if (failedCount) toast.error(`Rescan failed for ${failedCount} files!`);
        if (failedCount !== selectedFileIds.length) toast.success(`Rescanning ${selectedFileIds.length} files!`);
      })
      .catch(console.error);
  });

  const handleRefresh = useEventCallback(() => {
    resetQueries(['series']);
  });

  return (
    <div className="relative box-border flex h-13 grow items-center rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3">
      <MenuButton onClick={handleRefresh} icon={mdiRefresh} name="Refresh" />
      <TransitionDiv className="ml-4 flex grow gap-x-4" show={selectedFileIds.length !== 0}>
        <MenuButton onClick={rescanFiles} icon={mdiDatabaseSearchOutline} name="Rescan" />
        <MenuButton
          onClick={() => setSelectedRows({})}
          icon={mdiCloseCircleOutline}
          name="Cancel Selection"
          highlight
        />
      </TransitionDiv>
    </div>
  );
});

const ManuallyLinkedTab = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 200);

  const [selectedSeries, setSelectedSeries] = useState(0);

  const seriesQuery = useSeriesWithLinkedFilesInfiniteQuery({ pageSize: 25, search: debouncedSearch });
  const [series, seriesCount] = useFlattenListResult(seriesQuery.data);

  const episodesQuery = useSeriesEpisodesInfiniteQuery(
    selectedSeries,
    { pageSize: 25, includeDataFrom: ['AniDB'], includeFiles: true, includeManuallyLinked: IncludeOnlyFilterEnum.only },
    selectedSeries > 0,
  );
  const [episodes, episodeCount] = useFlattenListResult(episodesQuery.data);

  const {
    handleRowSelect,
    rowSelection,
    selectedRows,
    setRowSelection,
  } = useRowSelection(episodes);

  const selectedFileIds = useMemo(
    () => selectedRows.flatMap(row => row.Files?.map(file => file.ID) ?? []),
    [selectedRows],
  );

  const [unlinkingInProgress, setUnlinkingInProgress] = useState(false);

  const { mutateAsync: unlinkFile } = useDeleteFileLinkMutation();

  const unlinkFiles = useEventCallback(() => {
    const promises = selectedFileIds.map(fileId => unlinkFile(toNumber(fileId)));

    setUnlinkingInProgress(true);

    Promise
      .allSettled(promises)
      .then((result) => {
        const failedCount = countBy(result, 'status').rejected;
        if (failedCount) toast.error(`Error unlinking ${failedCount} files!`);
        if (failedCount !== selectedFileIds.length) toast.success(`${selectedFileIds.length} files unlinked!`);
        resetQueries(['series']);
        setUnlinkingInProgress(false);
      })
      .catch(console.error);
  });

  // Reset series selection if query data changes
  useEffect(() => {
    setSelectedSeries(0);
  }, [seriesQuery.data]);

  return (
    <>
      <title>Manually Linked Files | Shoko</title>
      <TransitionDiv className="flex grow flex-col gap-y-6 overflow-y-auto">
        <ShokoPanel
          title={<Title />}
          options={
            <ItemCount
              count={seriesCount}
              selected={selectedFileIds.length}
              suffix="Series"
              selectedSuffix={selectedFileIds.length === 1 ? 'File' : 'Files'}
            />
          }
        >
          <div className="flex items-center gap-x-3">
            <Input
              type="text"
              placeholder="Search..."
              startIcon={mdiMagnify}
              id="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              inputClassName="px-4 py-3"
            />
            <Menu selectedFileIds={selectedFileIds} setSelectedRows={setRowSelection} />
            <TransitionDiv show={selectedFileIds.length !== 0} className="flex gap-x-3">
              <Button
                buttonType="primary"
                buttonSize="normal"
                className="flex gap-x-2.5 px-4 py-3 font-semibold"
                onClick={unlinkFiles}
                loading={unlinkingInProgress}
              >
                <Icon path={mdiLinkOff} size={1} />
                Unlink
              </Button>
            </TransitionDiv>
          </div>
        </ShokoPanel>

        <div className="flex grow gap-x-3">
          <div className="flex w-1/2 overflow-y-auto rounded-md border border-panel-border bg-panel-background p-6">
            {seriesQuery.isPending && (
              <div className="flex grow items-center justify-center text-panel-text-primary">
                <Icon path={mdiLoading} size={4} spin />
              </div>
            )}

            {!seriesQuery.isPending && seriesCount === 0 && (
              <div className="flex grow items-center justify-center text-lg font-semibold">
                No series with manually linked files!
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
                handleRowSelect={handleRowSelect}
                rowSelection={rowSelection}
                setSelectedRows={setRowSelection}
              />
            )}
          </div>
        </div>
      </TransitionDiv>
    </>
  );
};

export default ManuallyLinkedTab;
