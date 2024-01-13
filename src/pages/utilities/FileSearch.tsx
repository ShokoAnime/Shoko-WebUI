import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiCloseCircleOutline,
  mdiDatabaseSearchOutline,
  mdiDatabaseSyncOutline,
  mdiLoading,
  mdiMagnify,
  mdiMinusCircleOutline,
  mdiOpenInNew,
  mdiRefresh,
} from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import { forEach, reverse } from 'lodash';
import prettyBytes from 'pretty-bytes';
import { useDebounce } from 'usehooks-ts';

import DeleteFilesModal from '@/components/Dialogs/DeleteFilesModal';
import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ShokoIcon from '@/components/ShokoIcon';
import FilesSummary from '@/components/Utilities/FilesSummary';
import ItemCount from '@/components/Utilities/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { useEpisodeAniDBQuery } from '@/core/react-query/episode/queries';
import { useDeleteFileMutation, useRehashFileMutation, useRescanFileMutation } from '@/core/react-query/file/mutations';
import { useFileQuery, useFilesInfiniteQuery } from '@/core/react-query/file/queries';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { useSeriesAniDBQuery } from '@/core/react-query/series/queries';
import { FileSortCriteriaEnum } from '@/core/types/api/file';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useMediaInfo from '@/hooks/useMediaInfo';
import useRowSelection from '@/hooks/useRowSelection';

import { staticColumns } from './UnrecognizedUtility';

import type { FileType } from '@/core/types/api/file';
import type { Updater } from 'use-immer';

type FileSelectedProps = {
  fileId: number;
};

const Menu = (
  props: {
    selectedRows: FileType[];
    setSelectedRows: Updater<Record<number, boolean>>;
  },
) => {
  const {
    selectedRows,
    setSelectedRows,
  } = props;

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { mutateAsync: deleteFile } = useDeleteFileMutation();
  const { mutateAsync: rehashFile } = useRehashFileMutation();
  const { mutateAsync: rescanFile } = useRescanFileMutation();

  const showDeleteConfirmation = useEventCallback(() => {
    setShowConfirmModal(true);
  });

  const cancelDelete = useEventCallback(() => {
    setShowConfirmModal(false);
  });

  const removeFileFromSelection = useEventCallback(
    (fileId: number) =>
      setSelectedRows((immerState) => {
        immerState[fileId] = false;
        return immerState;
      }),
  );

  const deleteFiles = useEventCallback(() => {
    setSelectedRows([]);
    let failedFiles = 0;
    forEach(selectedRows, (row) => {
      deleteFile({ fileId: row.ID, removeFolder: true }).catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Error deleting ${failedFiles} files!`);
    if (failedFiles !== selectedRows.length) toast.success(`${selectedRows.length} files deleted!`);
  });

  const rehashFiles = useEventCallback(() => {
    setSelectedRows([]);
    let failedFiles = 0;

    forEach(selectedRows, (file) => {
      rehashFile(file.ID).catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Rehash failed for ${failedFiles} files!`);
  });

  const rescanFiles = useEventCallback(() => {
    setSelectedRows([]);
    let failedFiles = 0;
    forEach(selectedRows, (file) => {
      rescanFile(file.ID).catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Rescan failed for ${failedFiles} files!`);
  });

  return (
    <div className="box-border flex grow items-center rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
      <div className={cx('grow gap-x-4', selectedRows.length === 0 ? 'flex' : 'hidden')}>
        <MenuButton
          onClick={() => {
            setSelectedRows([]);
            invalidateQueries(['files']);
          }}
          icon={mdiRefresh}
          name="Refresh"
        />
      </div>
      <div className={cx('grow gap-x-4', selectedRows.length !== 0 ? 'flex' : 'hidden')}>
        <MenuButton onClick={rescanFiles} icon={mdiDatabaseSearchOutline} name="Rescan" />
        <MenuButton onClick={rehashFiles} icon={mdiDatabaseSyncOutline} name="Rehash" />
        <MenuButton onClick={showDeleteConfirmation} icon={mdiMinusCircleOutline} name="Delete" highlight />
        <MenuButton
          onClick={() => setSelectedRows([])}
          icon={mdiCloseCircleOutline}
          name="Cancel Selection"
          highlight
        />
      </div>
      <DeleteFilesModal
        show={showConfirmModal}
        selectedFiles={selectedRows}
        removeFile={removeFileFromSelection}
        onClose={cancelDelete}
        onConfirm={deleteFiles}
      />
    </div>
  );
};

const FileDetails = (props: FileSelectedProps) => {
  const { fileId } = props;
  const { data: file } = useFileQuery(fileId, {
    include: ['XRefs', 'MediaInfo', 'AbsolutePaths'],
    includeDataFrom: ['AniDB'],
  }, !!fileId);
  const fileAniDbUrl = `https://anidb.net/file/${file?.AniDB?.ID}`;
  const seriesShokoId = file?.SeriesIDs?.[0]?.SeriesID?.ID ?? 0;
  const seriesAnidbId = file?.SeriesIDs?.[0].SeriesID.AniDB;
  const episodeId = file?.SeriesIDs?.[0].EpisodeIDs?.[0]?.ID ?? 0;
  const { data: seriesInfo } = useSeriesAniDBQuery(seriesAnidbId!, !!seriesAnidbId);
  const { data: episodeInfo } = useEpisodeAniDBQuery(episodeId, !!episodeId);

  const mediaInfo = useMediaInfo(file);

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">File Name</span>
          {file?.AniDB?.ID && (
            <a href={fileAniDbUrl} target="_blank" rel="noopener noreferrer">
              <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
                <div className="metadata-link-icon AniDB" />
                AniDB File
                <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
              </div>
            </a>
          )}
        </div>
        <span className="break-all">{mediaInfo.Name}</span>
      </div>
      <div className="flex flex-col gap-y-1">
        {seriesInfo !== undefined && (
          <div className="flex justify-between capitalize">
            <span className="font-semibold">Series Name</span>
            <Link to={`/webui/collection/series/${seriesShokoId}`}>
              <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
                <ShokoIcon className="w-6" />
                Shoko
                <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
              </div>
            </Link>
          </div>
        )}
        <span className="break-all">{seriesInfo?.Titles.find(x => x.Type === 'Main')?.Name ?? 'N/A'}</span>
      </div>
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Episode Name</span>
        </div>
        <span className="break-all">{episodeInfo?.Title ?? 'N/A'}</span>
      </div>
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Location</span>
        </div>
        <span className="break-all">{mediaInfo.Location ?? 'N/A'}</span>
      </div>
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Size</span>
        </div>
        <span className="break-all">{prettyBytes(mediaInfo.Size, { binary: true }) ?? 'N/A'}</span>
      </div>
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Video</span>
        </div>
        <span className="break-all">
          {mediaInfo.VideoInfo.length !== 0 ? mediaInfo.VideoInfo.join(' | ') : 'N/A'}
        </span>
      </div>
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Audio</span>
        </div>
        <span className="break-all">
          {mediaInfo.AudioInfo.length !== 0 ? mediaInfo.AudioInfo.join(' | ') : 'N/A'}
        </span>
      </div>
      <div className="flex flex-col gap-y-1">
        <div className="flex break-after-all justify-between capitalize">
          <span className="font-semibold">Hash</span>
        </div>
        <span className="break-all">{mediaInfo.Hashes.ED2K ?? ''}</span>
      </div>
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">CRC</span>
        </div>
        <span className="break-all">{mediaInfo.Hashes.CRC32 ?? ''}</span>
      </div>
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">SHA1</span>
        </div>
        <span className="break-all">{mediaInfo.Hashes.SHA1 ?? ''}</span>
      </div>
    </div>
  );
};

const FileSearch = () => {
  const [sortCriteria, setSortCriteria] = useState(-FileSortCriteriaEnum.ImportedAt);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);
  const filesQuery = useFilesInfiniteQuery({
    include: ['XRefs'],
    sortOrder: debouncedSearch ? [] : [sortCriteria],
    pageSize: 50,
  }, debouncedSearch);
  const [files, fileCount] = useFlattenListResult<FileType>(filesQuery.data);

  const {
    handleRowSelect,
    rowSelection,
    selectedRows,
    setRowSelection,
  } = useRowSelection<FileType>(files);

  const [viewIndex, setViewIndex] = useState(0);

  const onNextView = useEventCallback(() => {
    setViewIndex((prev) => {
      if (prev + 1 >= selectedRows.length) return 0;
      return prev + 1;
    });
  });

  const onPrevView = useEventCallback(() => {
    setViewIndex((prev) => {
      if (prev - 1 < 0) return selectedRows.length - 1;
      return prev - 1;
    });
  });

  const fileSearchSelectedRows = useMemo(() => reverse(selectedRows), [selectedRows]);
  const selectedId = useMemo(() => fileSearchSelectedRows[viewIndex]?.ID, [fileSearchSelectedRows, viewIndex]);

  return (
    <div className="flex grow flex-col gap-y-8">
      <ShokoPanel title="File Search" options={<ItemCount count={fileCount} selected={selectedRows?.length} />}>
        <div className="flex items-center gap-x-3">
          <Input
            type="text"
            placeholder="Search..."
            startIcon={mdiMagnify}
            id="search"
            onChange={({ target: { value } }) => {
              setSearch(_ => value);
            }}
            value={search}
            inputClassName="px-4 py-3"
          />
          <Menu
            selectedRows={selectedRows}
            setSelectedRows={setRowSelection}
          />
        </div>
      </ShokoPanel>
      <div className="contain-strict flex grow justify-between gap-x-8 overflow-y-auto">
        <div className="flex w-full rounded-md border border-panel-border bg-panel-background p-8 lg:max-w-[75%]">
          {filesQuery.isPending && (
            <div className="flex grow items-center justify-center text-panel-text-primary">
              <Icon path={mdiLoading} size={4} spin />
            </div>
          )}

          {!filesQuery.isPending && fileCount === 0 && (
            <div className="flex grow items-center justify-center font-semibold">No search results!</div>
          )}

          {filesQuery.isSuccess && fileCount > 0 && (
            <UtilitiesTable
              count={fileCount}
              fetchNextPage={filesQuery.fetchNextPage}
              handleRowSelect={handleRowSelect}
              columns={staticColumns}
              isFetchingNextPage={filesQuery.isFetchingNextPage}
              rows={files}
              rowSelection={rowSelection}
              setSelectedRows={setRowSelection}
              skipSort={!!debouncedSearch}
              setSortCriteria={setSortCriteria}
              sortCriteria={sortCriteria}
            />
          )}
        </div>
        <div className="flex w-full flex-col lg:max-w-[25%]">
          {selectedRows?.length > 0 && (
            <div className="flex h-full w-full flex-col overflow-y-auto overflow-x-hidden rounded-md border border-panel-border bg-panel-background p-8">
              <div className="flex w-full flex-col overflow-y-auto pr-4">
                <FilesSummary title="Selected Summary" items={selectedRows} />
                <div className="my-8 flex w-full text-xl font-semibold">
                  <div className="flex w-full justify-between">
                    <span className="grow">Selected File</span>
                    <div className={cx('flex', selectedRows.length <= 1 ? 'hidden' : '')}>
                      <Button buttonType="secondary" onClick={onPrevView}>
                        <Icon className="text-panel-icon-action" path={mdiChevronLeft} size={1} />
                      </Button>
                      <Button buttonType="secondary" onClick={onNextView}>
                        <Icon className="text-panel-icon-action" path={mdiChevronRight} size={1} />
                      </Button>
                    </div>
                  </div>
                </div>
                <FileDetails
                  fileId={selectedId ?? 0}
                />
              </div>
            </div>
          )}
          {!selectedRows?.length && (
            <div className="flex h-full w-full flex-col rounded-md border border-panel-border bg-panel-background p-8">
              <div className="flex grow items-center justify-center font-semibold">Select File To Populate</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default FileSearch;
