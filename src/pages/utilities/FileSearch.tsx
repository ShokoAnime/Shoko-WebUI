import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router';
import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiClipboardOutline,
  mdiCloseCircleOutline,
  mdiDatabaseSearchOutline,
  mdiDatabaseSyncOutline,
  mdiFileDocumentEditOutline,
  mdiLoading,
  mdiMagnify,
  mdiMinusCircleOutline,
  mdiOpenInNew,
  mdiRefresh,
} from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import { forEach, get, reverse } from 'lodash';
import prettyBytes from 'pretty-bytes';

import DeleteFilesModal from '@/components/Dialogs/DeleteFilesModal';
import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ShokoIcon from '@/components/ShokoIcon';
import toast from '@/components/Toast';
import FilesSummary from '@/components/Utilities/FilesSummary';
import ItemCount from '@/components/Utilities/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { staticColumns } from '@/components/Utilities/constants';
import { useEpisodeAniDBQuery } from '@/core/react-query/episode/queries';
import {
  useDeleteFilesMutation,
  useRehashFileMutation,
  useRescanFileMutation,
} from '@/core/react-query/file/mutations';
import { useFileQuery, useFilesInfiniteQuery } from '@/core/react-query/file/queries';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { useSeriesQuery } from '@/core/react-query/series/queries';
import { addFiles } from '@/core/slices/utilities/renamer';
import { FileSortCriteriaEnum } from '@/core/types/api/file';
import { copyToClipboard } from '@/core/util';
import getEd2kLink from '@/core/utilities/getEd2kLink';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useMediaInfo from '@/hooks/useMediaInfo';
import useNavigateVoid from '@/hooks/useNavigateVoid';
import useRowSelection from '@/hooks/useRowSelection';
import useTableSearchSortCriteria from '@/hooks/utilities/useTableSearchSortCriteria';

import type { FileType } from '@/core/types/api/file';
import type { Updater } from 'use-immer';

const Menu = (
  props: {
    selectedRows: FileType[];
    setSelectedRows: Updater<Record<number, boolean>>;
  },
) => {
  const { t } = useTranslation('utilities');
  const {
    selectedRows,
    setSelectedRows,
  } = props;

  const dispatch = useDispatch();
  const navigate = useNavigateVoid();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { mutate: deleteFiles } = useDeleteFilesMutation();
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

  const handleDelete = useEventCallback(() => {
    deleteFiles(
      {
        fileIds: selectedRows.map(row => row.ID),
        removeFolder: true,
      },
      {
        onSuccess: () => toast.success(`${selectedRows.length} files deleted!`),
        onError: () => toast.error('Files could not be deleted!'),
      },
    );
    setSelectedRows([]);
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

  const handleRename = useEventCallback(() => {
    dispatch(addFiles(selectedRows));
    navigate('/webui/utilities/renamer');
  });

  return (
    <div className="box-border flex grow items-center rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3">
      <div className={cx('grow gap-x-4', selectedRows.length === 0 ? 'flex' : 'hidden')}>
        <MenuButton
          onClick={() => {
            setSelectedRows([]);
            invalidateQueries(['files']);
          }}
          icon={mdiRefresh}
          name={t('common.actions.refresh')}
        />
      </div>
      <div className={cx('grow gap-x-4', selectedRows.length !== 0 ? 'flex' : 'hidden')}>
        <MenuButton onClick={rescanFiles} icon={mdiDatabaseSearchOutline} name={t('common.actions.rescan')} />
        <MenuButton onClick={rehashFiles} icon={mdiDatabaseSyncOutline} name={t('common.actions.rehash')} />
        <MenuButton onClick={handleRename} icon={mdiFileDocumentEditOutline} name={t('common.actions.rename')} />
        <MenuButton
          onClick={showDeleteConfirmation}
          icon={mdiMinusCircleOutline}
          name={t('common.actions.delete')}
          highlight
        />
        <MenuButton
          onClick={() => setSelectedRows([])}
          icon={mdiCloseCircleOutline}
          name={t('common.actions.cancelSelection')}
          highlight
        />
      </div>
      <DeleteFilesModal
        show={showConfirmModal}
        selectedFiles={selectedRows}
        removeFile={removeFileFromSelection}
        onClose={cancelDelete}
        onConfirm={handleDelete}
      />
    </div>
  );
};

const MediaInfoDetails = React.memo(({ file }: { file: FileType }) => {
  const { t } = useTranslation('utilities');
  const mediaInfo = useMediaInfo(file);
  const ed2kHash = useMemo(() => getEd2kLink(file), [file]);

  const copyEd2kLink = useEventCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    copyToClipboard(ed2kHash, 'ED2K Hash').catch(console.error);
  });

  return (
    <>
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">{t('fileDetails.location')}</span>
        </div>
        <span className="break-all">{mediaInfo.Location ?? t('common.na')}</span>
      </div>
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">{t('fileDetails.size')}</span>
        </div>
        <span className="break-all">{prettyBytes(mediaInfo.Size, { binary: true }) ?? t('common.na')}</span>
      </div>
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">{t('fileDetails.video')}</span>
        </div>
        <span className="break-all">
          {mediaInfo.VideoInfo.length !== 0 ? mediaInfo.VideoInfo.join(' | ') : t('common.na')}
        </span>
      </div>
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">{t('fileDetails.audio')}</span>
        </div>
        <span className="break-all">
          {mediaInfo.AudioInfo.length !== 0 ? mediaInfo.AudioInfo.join(' | ') : t('common.na')}
        </span>
      </div>
      <div className="flex flex-col gap-y-1">
        <div className="flex break-after-all justify-between capitalize">
          <span className="font-semibold">{t('fileDetails.ed2k')}</span>
        </div>
        <div className="flex break-after-all justify-between">
          <span className="break-all">{mediaInfo.Hashes.ED2K ?? ''}</span>
          <div className="cursor-pointer text-panel-icon-action" onClick={copyEd2kLink}>
            <Icon path={mdiClipboardOutline} size={1} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">{t('fileDetails.crc')}</span>
        </div>
        <span className="break-all">{mediaInfo.Hashes.CRC32 ?? ''}</span>
      </div>
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">{t('fileDetails.sha1')}</span>
        </div>
        <span className="break-all">{mediaInfo.Hashes.SHA1 ?? ''}</span>
      </div>
    </>
  );
});

const FileDetails = React.memo(({ fileId }: { fileId: number }) => {
  const { t } = useTranslation('utilities');
  const { data: file, isPending: fileQueryIsPending } = useFileQuery(
    fileId,
    {
      include: ['XRefs', 'MediaInfo', 'AbsolutePaths'],
      includeDataFrom: ['AniDB'],
    },
  );

  const seriesId: number = get(file, 'SeriesIDs[0].SeriesID.ID', 0);
  const { data: seriesInfo, isFetching: seriesQueryIsPending } = useSeriesQuery(
    seriesId,
    {},
    !!seriesId,
  );

  const episodeId: number = get(file, 'SeriesIDs[0].EpisodeIDs[0].ID', 0);
  const { data: episodeInfo, isFetching: episodeQueryIsPending } = useEpisodeAniDBQuery(
    episodeId,
    !!episodeId,
  );

  const isPending = useMemo(
    () => fileQueryIsPending || seriesQueryIsPending || episodeQueryIsPending,
    [
      fileQueryIsPending,
      seriesQueryIsPending,
      episodeQueryIsPending,
    ],
  );

  if (isPending) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} size={3} spin />
      </div>
    );
  }

  if (!file) {
    return (
      <div className="text-panel-text-danger">
        {t('fileDetails.errorFetching')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between">
          <span className="font-semibold">{t('fileDetails.fileName')}</span>
          {file.AniDB?.ID && (
            <a href={`https://anidb.net/file/${file.AniDB.ID}`} target="_blank" rel="noopener noreferrer">
              <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
                <div className="metadata-link-icon AniDB" />
                {t('fileDetails.anidbFile')}
                <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
              </div>
            </a>
          )}
        </div>
        <span className="break-all">{file.Locations[0]?.RelativePath?.split(/[\\/]+/g).pop()}</span>
      </div>

      {seriesInfo && (
        <div className="flex flex-col gap-y-1">
          <div className="flex justify-between">
            <span className="font-semibold">{t('fileDetails.seriesName')}</span>
            <Link to={`/webui/collection/series/${seriesId}`}>
              <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
                <ShokoIcon className="size-6" />
                {t('fileDetails.shoko')}
                <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
              </div>
            </Link>
          </div>
          <span className="break-all">{seriesInfo.Name}</span>
        </div>
      )}

      {episodeInfo && (
        <div className="flex flex-col gap-y-1">
          <div className="flex justify-between capitalize">
            <span className="font-semibold">{t('fileDetails.episodeName')}</span>
          </div>
          <span className="break-all">{episodeInfo.Title}</span>
        </div>
      )}

      <MediaInfoDetails file={file} />
    </div>
  );
});

const FileSearch = () => {
  const { t } = useTranslation('utilities');
  const {
    debouncedSearch,
    search,
    setSearch,
    setSortCriteria,
    sortCriteria,
  } = useTableSearchSortCriteria(-FileSortCriteriaEnum.CreatedAt);

  const filesQuery = useFilesInfiniteQuery({
    include: ['XRefs'],
    sortOrder: sortCriteria ? [sortCriteria] : undefined,
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
    <>
      <title>
        {t('fileSearch.pageTitle')}
        | Shoko
      </title>
      <div className="flex grow flex-col gap-y-6">
        <ShokoPanel
          title={t('fileSearch.title')}
          options={<ItemCount count={fileCount} selected={selectedRows?.length} />}
        >
          <div className="flex items-center gap-x-3">
            <Input
              type="text"
              placeholder={t('fileSearch.searchPlaceholder')}
              startIcon={mdiMagnify}
              id="search"
              onChange={setSearch}
              value={search}
              inputClassName="px-4 py-3"
            />
            <Menu
              selectedRows={selectedRows}
              setSelectedRows={setRowSelection}
            />
          </div>
        </ShokoPanel>
        <div className="flex grow justify-between gap-x-6 overflow-y-auto contain-strict">
          <div className="flex w-full rounded-lg border border-panel-border bg-panel-background p-6 lg:max-w-[75%]">
            {filesQuery.isPending && (
              <div className="flex grow items-center justify-center text-panel-text-primary">
                <Icon path={mdiLoading} size={4} spin />
              </div>
            )}

            {!filesQuery.isPending && fileCount === 0 && (
              <div className="flex grow items-center justify-center font-semibold">{t('fileSearch.noResults')}</div>
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
                setSortCriteria={setSortCriteria}
                sortCriteria={sortCriteria}
              />
            )}
          </div>
          <div className="flex w-full flex-col lg:max-w-[25%]">
            {selectedRows?.length > 0 && (
              <div className="flex size-full flex-col overflow-y-auto overflow-x-hidden rounded-lg border border-panel-border bg-panel-background p-6">
                <div className="flex w-full grow flex-col gap-y-6 overflow-y-auto pr-4">
                  <FilesSummary title={t('fileSearch.selectedSummary')} items={selectedRows} />
                  <div className="flex w-full text-xl font-semibold">
                    <div className="flex w-full justify-between">
                      <span className="grow">{t('fileDetails.selectedFile')}</span>
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
                  <FileDetails fileId={selectedId} />
                </div>
              </div>
            )}
            {!selectedRows?.length && (
              <div className="flex size-full flex-col rounded-lg border border-panel-border bg-panel-background p-6">
                <div className="flex grow items-center justify-center font-semibold">
                  {t('fileSearch.selectFileToPopulate')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default FileSearch;
