import React, { useMemo, useState } from 'react';
import { Menu, MenuButton, MenuItems } from '@headlessui/react';
import {
  mdiClipboardOutline,
  mdiDatabaseSearchOutline,
  mdiDotsVertical,
  mdiFileDocumentMultipleOutline,
  mdiOpenInNew,
  mdiPlusCircleOutline,
  mdiTagRemoveOutline,
  mdiTrashCanOutline,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { map } from 'lodash';

import DeleteFilesModal from '@/components/Dialogs/DeleteFilesModal';
import FileInfo from '@/components/FileInfo';
import Button from '@/components/Input/Button';
import DropdownMenuItem from '@/components/Input/DropdownMenuItem';
import {
  useAddFileToMyListMutation,
  useDeleteFileMutation,
  useMarkVariationMutation,
  useRescanFileMutation,
} from '@/core/react-query/file/mutations';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { useDeleteReleaseInfoForFileByIdMutation } from '@/core/react-query/release-info/mutations';
import toast from '@/core/toast';
import { copyToClipboard } from '@/core/util';

import type { FileType } from '@/core/types/api/file';

type Props = {
  anidbSeriesId: number;
  episodeFiles: FileType[];
  episodeId: number;
  seriesId: number;
};

const EpisodeFiles = ({ anidbSeriesId, episodeFiles, episodeId, seriesId }: Props) => {
  const { isPending: isAddMyListPending, mutate: addFileToMyList } = useAddFileToMyListMutation();
  const { mutate: deleteFile } = useDeleteFileMutation(seriesId, episodeId);
  const { mutate: deleteReleaseInfo } = useDeleteReleaseInfoForFileByIdMutation();
  const { mutate: markFileAsVariation } = useMarkVariationMutation();
  const { mutate: rescanFile } = useRescanFileMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFileToDelete, setSelectedFileToDelete] = useState<FileType | null>(null);
  const selectedFilesToDelete = useMemo(
    () => (selectedFileToDelete ? [selectedFileToDelete] : []),
    [selectedFileToDelete],
  );

  const handleDelete = () => {
    if (!selectedFileToDelete) return;
    deleteFile({ fileId: selectedFileToDelete.ID, removeFolder: true }, {
      onSuccess: () => {
        toast.success('Deleted file!');
        invalidateQueries(['episode', 'files', episodeId]);
      },
      onError: error => toast.error(`Failed to delete file! ${error.message}`),
    });
  };

  const handleDeleteReleaseInfo = (fileId: number) => {
    deleteReleaseInfo(fileId, {
      onSuccess: () => {
        toast.success('Removed release info!');
        invalidateQueries(['episode', 'files', episodeId]);
      },
      onError: error => toast.error(`Failed to remove release info! ${error.message}`),
    });
  };

  const closeDeleteModal = () => {
    setSelectedFileToDelete(null);
    setShowDeleteModal(false);
  };

  const handleAddToMyList = (id: number) =>
    addFileToMyList(id, {
      onSuccess: () => toast.success('Added file to MyList!'),
      onError: error => toast.error(`Failed to add file to MyList! ${error.message}`),
    });

  const handleRescan = (id: number) =>
    rescanFile(id, {
      onSuccess: () => toast.success('Rescanning file!'),
      onError: error => toast.error(`Rescan failed for file! ${error.message}`),
    });

  const handleMarkVariation = (fileId: number, variation: boolean) =>
    markFileAsVariation({ fileId, variation }, {
      onSuccess: () => toast.success(`${variation ? 'Marked' : 'Unmarked'} file as variation!`),
      onError: error =>
        toast.error(`${variation ? 'Marking' : 'Unmarking'} file as variation failed! ${error.message}`),
    });

  const handleCopyToClipboard = (id: string) => {
    copyToClipboard(id, 'Shoko File ID').catch(console.error);
  };

  if (!episodeFiles.length || episodeFiles.length < 1) {
    return <div className="flex grow items-center justify-center p-6 pt-4 font-semibold">No files found!</div>;
  }

  return (
    <div className="flex flex-col gap-y-6 p-6 pt-4">
      {map(episodeFiles, (file) => {
        const releaseGroup = file.Release?.Group;

        return (
          <div className="flex flex-col gap-y-6" key={file.ID}>
            <div className="flex grow gap-x-2">
              <div className="flex grow flex-wrap gap-4 rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3">
                {episodeFiles.length > 1 && (
                  <div
                    className="flex cursor-pointer items-center gap-x-2"
                    onClick={() => handleMarkVariation(file.ID, !file.IsVariation)}
                  >
                    <Icon
                      className="hidden text-panel-icon-action lg:inline"
                      path={mdiFileDocumentMultipleOutline}
                      size={1}
                    />
                    {file.IsVariation ? 'Unmark' : 'Mark'}
                    &nbsp;as Variation
                  </div>
                )}
                <div
                  className="flex cursor-pointer items-center gap-x-2"
                  onClick={() => handleCopyToClipboard(file.ID.toString())}
                >
                  <Icon
                    className="hidden text-panel-icon-action lg:inline"
                    path={mdiClipboardOutline}
                    size={1}
                  />
                  Copy ShokoID
                </div>
                {file.Release?.ReleaseURI?.startsWith('https://anidb.net/file/') && (
                  <a href={file.Release.ReleaseURI} target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
                      <div className="metadata-link-icon AniDB" />
                      AniDB
                      <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
                    </div>
                  </a>
                )}
                {releaseGroup?.Source === 'AniDB' && (
                  <a
                    href={`https://anidb.net/group/${releaseGroup.ID}/anime/${anidbSeriesId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
                      <div className="metadata-link-icon AniDB" />
                      {releaseGroup.Name}
                      &nbsp;(AniDB)
                      <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
                    </div>
                  </a>
                )}

                {file.IsVariation && <span className="ml-auto font-semibold text-panel-text-important">Variation</span>}
              </div>
              <div className="flex text-center">
                <Menu>
                  <MenuButton>
                    {({ open }) => (
                      <Button
                        buttonType="secondary"
                        buttonSize="normal"
                        className={cx('h-full', open && 'bg-button-secondary-hover')}
                      >
                        <Icon path={mdiDotsVertical} size={1} />
                      </Button>
                    )}
                  </MenuButton>
                  <MenuItems
                    anchor="bottom end"
                    transition
                    className="w-auto origin-top-right rounded-lg border border-panel-border bg-panel-background-alt drop-shadow-sm transition [--anchor-gap:--spacing(2)] data-closed:scale-95 data-closed:opacity-0"
                  >
                    <DropdownMenuItem
                      icon={mdiDatabaseSearchOutline}
                      text="Force Update Info"
                      onClick={() => handleRescan(file.ID)}
                    />

                    <DropdownMenuItem
                      icon={mdiPlusCircleOutline}
                      loading={isAddMyListPending}
                      text="Add to MyList"
                      onClick={() => handleAddToMyList(file.ID)}
                    />

                    <DropdownMenuItem
                      icon={mdiTagRemoveOutline}
                      onClick={() => handleDeleteReleaseInfo(file.ID)}
                      text="Remove Release Info"
                    />

                    <DropdownMenuItem
                      icon={mdiTrashCanOutline}
                      text="Delete File"
                      onClick={() => {
                        setShowDeleteModal(true);
                        setSelectedFileToDelete(file);
                      }}
                      type="danger"
                    />
                  </MenuItems>
                </Menu>
              </div>
            </div>
            <FileInfo file={file} />
          </div>
        );
      })}
      <DeleteFilesModal
        show={showDeleteModal}
        selectedFiles={selectedFilesToDelete}
        removeFile={closeDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default EpisodeFiles;
