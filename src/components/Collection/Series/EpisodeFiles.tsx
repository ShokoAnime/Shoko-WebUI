import React, { useMemo, useState } from 'react';
import { mdiEyeOutline, mdiOpenInNew, mdiRefresh, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { get, map } from 'lodash';

import DeleteFilesModal from '@/components/Dialogs/DeleteFilesModal';
import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import { useDeleteFileMutation, useRescanFileMutation } from '@/core/react-query/file/mutations';
import { invalidateQueries } from '@/core/react-query/queryClient';

import EpisodeFileInfo from './EpisodeFileInfo';

import type { FileType } from '@/core/types/api/file';

type Props = {
  animeId: number;
  episodeFiles: FileType[];
  episodeId: number;
};

const EpisodeFiles = ({ animeId, episodeFiles, episodeId }: Props) => {
  const { mutate: deleteFile } = useDeleteFileMutation();
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

  const handleRescan = (id: number) =>
    rescanFile(id, {
      onSuccess: () => toast.success('Rescanning file!'),
      onError: error => toast.error(`Rescan failed for file! ${error.message}`),
    });

  if (!episodeFiles.length || episodeFiles.length < 1) {
    return <div className="flex grow items-center justify-center p-8 pt-4 font-semibold">No files found!</div>;
  }

  return (
    <div className="flex flex-col gap-y-8 p-8 pt-4">
      {map(episodeFiles, (selectedFile) => {
        const ReleaseGroupID = get(selectedFile, 'AniDB.ReleaseGroup.ID', 0);
        const ReleaseGroupName = get(selectedFile, 'AniDB.ReleaseGroup.Name', null);

        return (
          <div className="flex flex-col gap-y-8" key={selectedFile.ID}>
            <div className="flex grow gap-x-2">
              <div className="flex grow gap-x-3 rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
                <div
                  className="flex cursor-pointer items-center gap-x-2"
                  onClick={() => handleRescan(selectedFile.ID)}
                >
                  <Icon className="text-panel-icon-action" path={mdiRefresh} size={1} />
                  Force Update File Info
                </div>
                <div className="flex items-center gap-x-2">
                  <Icon className="text-panel-icon-action" path={mdiEyeOutline} size={1} />
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
                  className="flex gap-x-2 px-4 py-3"
                  onClick={() => {
                    setShowDeleteModal(true);
                    setSelectedFileToDelete(selectedFile);
                  }}
                >
                  <Icon path={mdiTrashCanOutline} size={1} />
                  Delete File
                </Button>
              </div>
            </div>

            <EpisodeFileInfo file={selectedFile} />
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
