import React, { createContext, useCallback, useContext, useMemo } from 'react';
import {
  mdiCloseCircleOutline,
  mdiDatabaseSearchOutline,
  mdiLinkOff,
  mdiLoading,
  mdiOpenInNew,
  mdiRefresh,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import { toNumber } from 'lodash';
import { useImmer } from 'use-immer';
import { useEventCallback } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import ItemCount from '@/components/Utilities/Unrecognized/ItemCount';
import ManuallyLinkedFilesRow from '@/components/Utilities/Unrecognized/ManuallyLinkedFilesRow';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import Title from '@/components/Utilities/Unrecognized/Title';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { useDeleteFileLinkMutation, useRescanFileMutation } from '@/core/react-query/file/mutations';
import { invalidateTags } from '@/core/react-query/queryClient';
import { prefetchSeriesEpisodesInfiniteQuery, prefetchSeriesFilesQuery } from '@/core/react-query/series/prefetch';
import {
  useSeriesEpisodesInfiniteQuery,
  useSeriesFilesQuery,
  useSeriesWithLinkedFilesInfiniteQuery,
} from '@/core/react-query/series/queries';
import { dayjs } from '@/core/util';
import { useFlattenListResult } from '@/hooks/useFlattenListResult';

import type { SeriesType } from '@/core/types/api/series';
import type { UtilityHeaderType } from '@/pages/utilities/UnrecognizedUtility';
import type { Updater } from 'use-immer';

const columns: UtilityHeaderType<SeriesType>[] = [
  {
    id: 'series',
    name: 'Series',
    className: 'overflow-hidden line-clamp-1 grow basis-0',
    item: series => series.Name,
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

const useUpdateSelectedFiles = (setSelectedFiles: Updater<Record<number, boolean>>) =>
  useCallback(
    (fileIds: number[], select = true) => {
      setSelectedFiles((immerState) => {
        fileIds.forEach((fileId) => {
          immerState[fileId] = select;
        });
      });
    },
    [setSelectedFiles],
  );

const FilesTable = ({ id, open }: { id: number, open: boolean }) => {
  const filesQuery = useSeriesFilesQuery(id, { include: ['XRefs'], include_only: ['ManualLinks'] }, open);
  const episodesQuery = useSeriesEpisodesInfiniteQuery(
    id,
    {
      pageSize: 0,
      includeMissing: 'true',
      includeDataFrom: ['AniDB'],
    },
    open,
  );
  const [episodes] = useFlattenListResult(episodesQuery.data);

  const { selectedFiles, setSelectedFiles } = useContext(SelectedFilesContext) as SelectedFilesType;
  const updateSelectedFiles = useUpdateSelectedFiles(setSelectedFiles);

  return (
    <ManuallyLinkedFilesRow
      updateSelectedFiles={updateSelectedFiles}
      selectedFiles={selectedFiles}
      files={filesQuery?.data ?? []}
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

  const refreshData = () => {
    invalidateTags('UtilitiesRefresh');
    setSelectedFiles({});
  };

  const rescanFiles = () => {
    let failedFiles = 0;
    selectedIds.forEach((fileId) => {
      rescanFile(fileId).catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Rescan failed for ${failedFiles} files!`);
    if (failedFiles !== selectedIds.length) toast.success(`Rescanning ${selectedIds.length} files!`);
  };

  return (
    <div className="relative box-border flex grow items-center rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
      <MenuButton onClick={refreshData} icon={mdiRefresh} name="Refresh" />
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

    let failedFiles = 0;
    fileIds.forEach((fileId) => {
      unlinkFile(toNumber(fileId)).catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Error unlinking ${failedFiles} files!`);
    if (failedFiles !== fileIds.length) toast.success(`${fileIds.length} files unlinked!`);

    invalidateTags('UtilitiesRefresh');
    setSelectedFiles({});
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
