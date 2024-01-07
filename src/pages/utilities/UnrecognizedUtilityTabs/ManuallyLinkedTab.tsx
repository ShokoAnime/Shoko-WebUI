import React, { createContext, useContext, useMemo } from 'react';
import {
  mdiCloseCircleOutline,
  mdiDatabaseSearchOutline,
  mdiLinkOff,
  mdiLoading,
  mdiOpenInNew,
  mdiRefresh,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import { countBy, toNumber } from 'lodash';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import ItemCount from '@/components/Utilities/ItemCount';
import ManuallyLinkedFilesRow from '@/components/Utilities/Unrecognized/ManuallyLinkedFilesRow';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import Title from '@/components/Utilities/Unrecognized/Title';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { useDeleteFileLinkMutation, useRescanFileMutation } from '@/core/react-query/file/mutations';
import queryClient, { invalidateQueries } from '@/core/react-query/queryClient';
import { prefetchSeriesEpisodesInfiniteQuery, prefetchSeriesFilesQuery } from '@/core/react-query/series/prefetch';
import { useSeriesWithLinkedFilesInfiniteQuery } from '@/core/react-query/series/queries';
import { dayjs } from '@/core/util';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { ListResultType } from '@/core/types/api';
import type { EpisodeType } from '@/core/types/api/episode';
import type { FileType } from '@/core/types/api/file';
import type { SeriesType } from '@/core/types/api/series';
import type { UtilityHeaderType } from '@/pages/utilities/UnrecognizedUtility';
import type { InfiniteData } from '@tanstack/react-query';
import type { Updater } from 'use-immer';

const columns: UtilityHeaderType<SeriesType>[] = [
  {
    id: 'series',
    name: 'Series',
    className: 'line-clamp-2 grow basis-0 overflow-hidden',
    item: series => <div className={series.Name}>series.Name</div>,
  },
  {
    id: 'id',
    name: 'AniDB ID',
    className: 'w-32',
    item: series => (
      <div className="flex justify-between">
        {series.IDs.AniDB}
        <a
          href={`https://anidb.net/anime/${series.IDs.AniDB}`}
          target="_blank"
          rel="noreferrer noopener"
          className="mr-6 cursor-pointer text-panel-text-primary"
          aria-label="Open AniDB series page"
          onClick={e => e.stopPropagation()}
        >
          <Icon path={mdiOpenInNew} size={1} />
        </a>
      </div>
    ),
  },
  {
    id: 'link-count',
    name: 'Link Count',
    className: 'w-32',
    item: (series) => {
      const count = series.Sizes.FileSources.Unknown;
      return `${count} ${count === 1 ? 'file' : 'files'}`;
    },
  },
  // TODO: Either actually use "date linked" here or remove the column
  {
    id: 'created',
    name: 'Date Added',
    className: 'w-64',
    item: series => dayjs(series.Created).format('MMMM DD YYYY, HH:mm'),
  },
];

type SelectedFilesType = { selectedFiles: Record<number, boolean>, setSelectedFiles: Updater<Record<number, boolean>> };

const SelectedFilesContext = createContext<
  SelectedFilesType | undefined
>(undefined);

const refreshData = () => {
  invalidateQueries(['series', 'episodes']);
  invalidateQueries(['series', 'files']);
  invalidateQueries(['series', 'linked-files']);
};

const useUpdateSelectedFiles = (setSelectedFiles: Updater<Record<number, boolean>>) =>
  useEventCallback(
    (fileIds: number[], select = true) => {
      setSelectedFiles((immerState) => {
        fileIds.forEach((fileId) => {
          immerState[fileId] = select;
        });
      });
    },
  );

const FilesTable = ({ id: seriesId }: { id: number }) => {
  // We are prefetching the query before opening this "dropdown", so just fetching from cache instead.
  const files = queryClient.getQueryData<ListResultType<FileType>>(
    ['series', 'files', seriesId, { include: ['XRefs'], include_only: ['ManualLinks'] }],
  );
  const episodesResult = queryClient.getQueryData<InfiniteData<ListResultType<EpisodeType>>>(
    [
      'series',
      'episodes',
      seriesId,
      {
        pageSize: 0,
        includeMissing: 'true',
        includeDataFrom: ['AniDB'],
      },
    ],
  );
  const [episodes] = useFlattenListResult(episodesResult);

  const { selectedFiles, setSelectedFiles } = useContext(SelectedFilesContext)!;
  // TODO: Check if ManuallyLinkedFilesRow can be memoized so that the below useEventCallback is actually useful.
  const updateSelectedFiles = useUpdateSelectedFiles(setSelectedFiles);

  return (
    <ManuallyLinkedFilesRow
      updateSelectedFiles={updateSelectedFiles}
      selectedFiles={selectedFiles}
      files={files?.List ?? []}
      episodes={episodes ?? []}
    />
  );
};

const Menu = (props: SelectedFilesType) => {
  const { selectedFiles, setSelectedFiles } = props;
  const selectedIds = useMemo(
    () => Object.keys(selectedFiles).filter(key => selectedFiles[key]).map(toNumber),
    [selectedFiles],
  );

  const { mutateAsync: rescanFile } = useRescanFileMutation();

  const handleRefresh = useEventCallback(() => {
    refreshData();
    setSelectedFiles({});
  });

  const rescanFiles = useEventCallback(() => {
    const promises = selectedIds.map(fileId => rescanFile(fileId));

    Promise
      .allSettled(promises)
      .then((result) => {
        const failedCount = countBy(result, 'status').rejected;
        if (failedCount) toast.error(`Rescan failed for ${failedCount} files!`);
        if (failedCount !== selectedIds.length) toast.success(`Rescanning ${selectedIds.length} files!`);
      })
      .catch(console.error);
  });

  return (
    <div className="relative box-border flex grow items-center rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
      <MenuButton onClick={handleRefresh} icon={mdiRefresh} name="Refresh" />
      <TransitionDiv className="ml-4 flex grow gap-x-4" show={selectedIds.length !== 0}>
        <MenuButton onClick={rescanFiles} icon={mdiDatabaseSearchOutline} name="Rescan" />
        <MenuButton
          onClick={() => setSelectedFiles({})}
          icon={mdiCloseCircleOutline}
          name="Cancel Selection"
          highlight
        />
      </TransitionDiv>
      <span className="ml-auto text-panel-text-important">
        {selectedIds.length}
        &nbsp;
      </span>
      {selectedIds.length === 1 ? 'File ' : 'Files '}
      Selected
    </div>
  );
};

function ManuallyLinkedTab() {
  const seriesQuery = useSeriesWithLinkedFilesInfiniteQuery({ pageSize: 25 });
  const [series, seriesCount] = useFlattenListResult(seriesQuery.data);

  const { mutateAsync: unlinkFile } = useDeleteFileLinkMutation();

  const [selectedFiles, setSelectedFiles] = useImmer<Record<number, boolean>>({});

  const unlinkFiles = useEventCallback(() => {
    const fileIds = Object.keys(selectedFiles);

    const promises = fileIds.map(fileId => unlinkFile(toNumber(fileId)));

    Promise
      .allSettled(promises)
      .then((result) => {
        const failedCount = countBy(result, 'status').rejected;
        if (failedCount) toast.error(`Error unlinking ${failedCount} files!`);
        if (failedCount !== fileIds.length) toast.success(`${fileIds.length} files unlinked!`);
        refreshData();
        setSelectedFiles({});
      })
      .catch(console.error);
  });

  const onExpand = async (id: number) => {
    await prefetchSeriesFilesQuery(id, { include: ['XRefs'], include_only: ['ManualLinks'] });
    await prefetchSeriesEpisodesInfiniteQuery(id, { pageSize: 0, includeMissing: 'true', includeDataFrom: ['AniDB'] });
  };

  const selectedFilesContextValue = useMemo(
    () => ({ selectedFiles, setSelectedFiles } as SelectedFilesType),
    [selectedFiles, setSelectedFiles],
  );

  return (
    <TransitionDiv className="flex grow flex-col gap-y-8 overflow-y-auto">
      <div>
        <ShokoPanel title={<Title />} options={<ItemCount count={seriesCount} series />}>
          <div className="flex items-center gap-x-3">
            {/* Endpoint doesn't have search */}
            {/* <Input */}
            {/*   type="text" */}
            {/*   placeholder="Search..." */}
            {/*   startIcon={mdiMagnify} */}
            {/*   id="search" */}
            {/*   value="" */}
            {/*   onChange={(e) => {}} */}
            {/*   inputClassName="px-4 py-3" */}
            {/* /> */}
            <Menu selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
            <TransitionDiv show={Object.keys(selectedFiles).length !== 0} className="flex gap-x-3">
              <Button
                buttonType="primary"
                className="flex gap-x-2.5 px-4 py-3 font-semibold"
                onClick={unlinkFiles}
              >
                <Icon path={mdiLinkOff} size={0.8333} />
                Unlink
              </Button>
            </TransitionDiv>
          </div>
        </ShokoPanel>
      </div>

      <div className="flex grow overflow-y-auto rounded-md border border-panel-border bg-panel-background px-4 py-8">
        {seriesQuery.isPending && (
          <div className="flex grow items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}

        {!seriesQuery.isPending && seriesCount === 0 && (
          <div className="flex grow items-center justify-center font-semibold">
            No manually linked files!
          </div>
        )}

        {seriesQuery.isSuccess && seriesCount > 0 && (
          <SelectedFilesContext.Provider value={selectedFilesContextValue}>
            <UtilitiesTable
              ExpandedNode={FilesTable}
              columns={columns}
              count={seriesCount}
              fetchNextPage={seriesQuery.fetchNextPage}
              isFetchingNextPage={seriesQuery.isFetchingNextPage}
              onExpand={onExpand}
              rows={series}
              skipSort
            />
          </SelectedFilesContext.Provider>
        )}
      </div>
    </TransitionDiv>
  );
}

export default ManuallyLinkedTab;
