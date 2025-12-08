import React, { useMemo, useState } from 'react';
import {
  mdiClipboardOutline,
  mdiDatabaseSearchOutline,
  mdiFileDocumentMultipleOutline,
  mdiLoading,
  mdiOpenInNew,
  mdiPlusCircleOutline,
  mdiTrashCanOutline,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import { get, map } from 'lodash';

import DeleteFilesModal from '@/components/Dialogs/DeleteFilesModal';
import FileInfo from '@/components/FileInfo';
import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import {
  useAddFileToMyListMutation,
  useDeleteFileMutation,
  useMarkVariationMutation,
  useRescanFileMutation,
} from '@/core/react-query/file/mutations';
import { invalidateQueries } from '@/core/react-query/queryClient';
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
        const ReleaseGroupID = get(file, 'AniDB.ReleaseGroup.ID', 0);
        const ReleaseGroupName = get(file, 'AniDB.ReleaseGroup.Name', null);

        return (
          <div className="flex flex-col gap-y-6" key={file.ID}>
            <div className="flex grow gap-x-2">
              <div className="flex grow flex-wrap gap-4 rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3">
                <div
                  className="flex cursor-pointer items-center gap-x-2"
                  onClick={() => handleRescan(file.ID)}
                >
                  <Icon className="hidden text-panel-icon-action lg:inline" path={mdiDatabaseSearchOutline} size={1} />
                  Force Update Info
                </div>
                <div
                  className="flex cursor-pointer items-center gap-x-2"
                  onClick={() => handleAddToMyList(file.ID)}
                >
                  <Icon
                    className="hidden text-panel-icon-action lg:inline"
                    path={isAddMyListPending ? mdiLoading : mdiPlusCircleOutline}
                    spin={isAddMyListPending}
                    size={1}
                  />
                  Add to MyList
                </div>
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
                {file.AniDB && (
                  <a href={`https://anidb.net/file/${file.AniDB.ID}`} target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
                      <div className="metadata-link-icon AniDB" />
                      AniDB
                      <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
                    </div>
                  </a>
                )}
                {ReleaseGroupID > 0 && (
                  <a
                    href={`https://anidb.net/group/${ReleaseGroupID}/anime/${anidbSeriesId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
                      <div className="metadata-link-icon AniDB" />
                      {ReleaseGroupName ?? 'Unknown'}
                      &nbsp;(AniDB)
                      <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
                    </div>
                  </a>
                )}

                {file.IsVariation && <span className="ml-auto font-semibold text-panel-text-important">Variation</span>}
              </div>
              <div className="flex text-center">
                <Button
                  buttonType="danger"
                  className="flex items-center gap-x-2 px-4 py-3"
                  onClick={() => {
                    setShowDeleteModal(true);
                    setSelectedFileToDelete(file);
                  }}
                >
                  <Icon path={mdiTrashCanOutline} size={1} />
                  <span className="hidden lg:inline">Delete File</span>
                </Button>
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
