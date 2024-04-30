import React, { useMemo, useState } from 'react';
import { mdiDatabaseSearchOutline, mdiFileDocumentMultipleOutline, mdiOpenInNew, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { get, map } from 'lodash';

import DeleteFilesModal from '@/components/Dialogs/DeleteFilesModal';
import FileInfo from '@/components/FileInfo';
import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import {
  useDeleteFileMutation,
  useMarkVariationMutation,
  useRescanFileMutation,
} from '@/core/react-query/file/mutations';
import { invalidateQueries } from '@/core/react-query/queryClient';
import useEventCallback from '@/hooks/useEventCallback';

import type { FileType } from '@/core/types/api/file';

type Props = {
  animeId: number;
  episodeFiles: FileType[];
  episodeId: number;
};

const EpisodeFiles = ({ animeId, episodeFiles, episodeId }: Props) => {
  const { mutate: deleteFile } = useDeleteFileMutation();
  const { mutate: markFileAsVariation } = useMarkVariationMutation();
  const { mutate: rescanFile } = useRescanFileMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFileToDelete, setSelectedFileToDelete] = useState<FileType | null>(null);
  const selectedFilesToDelete = useMemo(
    () => (selectedFileToDelete ? [selectedFileToDelete] : []),
    [selectedFileToDelete],
  );

  const handleDelete = useEventCallback(() => {
    if (!selectedFileToDelete) return;
    deleteFile({ fileId: selectedFileToDelete.ID, removeFolder: true }, {
      onSuccess: () => {
        toast.success('Deleted file!');
        invalidateQueries(['episode', 'files', episodeId]);
      },
      onError: error => toast.error(`Failed to delete file! ${error.message}`),
    });
  });

  const closeDeleteModal = useEventCallback(() => {
    setSelectedFileToDelete(null);
    setShowDeleteModal(false);
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

  if (!episodeFiles.length || episodeFiles.length < 1) {
    return <div className="flex grow items-center justify-center p-6 pt-4 font-semibold">No files found!</div>;
  }

  return (
    <div className="flex flex-col gap-y-6 p-6 pt-4">
      {map(episodeFiles, (selectedFile) => {
        const ReleaseGroupID = get(selectedFile, 'AniDB.ReleaseGroup.ID', 0);
        const ReleaseGroupName = get(selectedFile, 'AniDB.ReleaseGroup.Name', null);

        return (
          <div className="flex flex-col gap-y-6" key={selectedFile.ID}>
            <div className="flex grow gap-x-2">
              <div className="flex grow gap-x-4 rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3">
                <div
                  className="flex cursor-pointer items-center gap-x-2"
                  onClick={() => handleRescan(selectedFile.ID)}
                >
                  <Icon className="hidden text-panel-icon-action lg:inline" path={mdiDatabaseSearchOutline} size={1} />
                  Force Update File Info
                </div>
                <div
                  className="flex cursor-pointer items-center gap-x-2"
                  onClick={() => handleMarkVariation(selectedFile.ID, !selectedFile.IsVariation)}
                >
                  <Icon
                    className="hidden text-panel-icon-action lg:inline"
                    path={mdiFileDocumentMultipleOutline}
                    size={1}
                  />
                  {selectedFile.IsVariation ? 'Unmark' : 'Mark'}
                  &nbsp;File as Variation
                </div>
                {selectedFile.AniDB && (
                  <a href={`https://anidb.net/file/${selectedFile.AniDB.ID}`} target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
                      <div className="metadata-link-icon AniDB" />
                      {`${selectedFile.AniDB.ID} (AniDB)`}
                      <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
                    </div>
                  </a>
                )}
                {ReleaseGroupID > 0 && (
                  <a
                    href={`https://anidb.net/group/${ReleaseGroupID}/anime/${animeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
                      <div className="metadata-link-icon AniDB" />
                      {ReleaseGroupName ?? 'Unknown'}
                      &nbsp; (AniDB)
                      <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
                    </div>
                  </a>
                )}

                {selectedFile.IsVariation && (
                  <span className="ml-auto font-semibold text-panel-text-important">Variation</span>
                )}
              </div>
              <div className="flex text-center">
                <Button
                  buttonType="danger"
                  className="flex items-center gap-x-2 px-4 py-3"
                  onClick={() => {
                    setShowDeleteModal(true);
                    setSelectedFileToDelete(selectedFile);
                  }}
                >
                  <Icon path={mdiTrashCanOutline} size={1} />
                  <span className="hidden lg:inline">Delete File</span>
                </Button>
              </div>
            </div>

            <FileInfo file={selectedFile} />
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
