import React, { useMemo, useState } from 'react';
import { mdiEyeOutline, mdiOpenInNew, mdiRefresh, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { get, map } from 'lodash';

import DeleteFilesModal from '@/components/Dialogs/DeleteFilesModal';
import toast from '@/components/Toast';
import { useDeleteFileMutation, usePostFileRescanMutation } from '@/core/rtkQuery/splitV3Api/fileApi';

import EpisodeFileInfo from './EpisodeFileInfo';

import type { FileType } from '@/core/types/api/file';

type Props = {
  episodeFiles: FileType[];
};

const EpisodeFiles = ({ episodeFiles }: Props) => {
  const [fileDeleteTrigger] = useDeleteFileMutation();
  const [fileRescanTrigger] = usePostFileRescanMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFileToDelete, setSelectedFileToDelete] = useState<FileType | null>(null);
  const selectedFilesToDelete = useMemo(() => (selectedFileToDelete ? [selectedFileToDelete] : []), [
    selectedFileToDelete,
  ]);

  const deleteFiles = async () => {
    if (!selectedFileToDelete) return;
    try {
      // eslint-disable-next-line no-await-in-loop
      await fileDeleteTrigger({ fileId: selectedFileToDelete.ID, removeFolder: true }).unwrap();
      toast.success('Deleted file!');
    } catch (error) {
      toast.error(`Failed to delete file! ${error}`);
    }
  };

  const closeDeleteModal = () => {
    setSelectedFileToDelete(null);
    setShowDeleteModal(false);
  };

  const rescanFile = async (id: number) => {
    try {
      await fileRescanTrigger(id).unwrap();
      toast.success('Rescanning file!');
    } catch (error) {
      toast.error(`Rescan failed for file! ${error}`);
    }
  };

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
            <div className="flex grow gap-x-3 rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
              <div
                className="flex cursor-pointer items-center gap-x-2"
                onClick={async () => {
                  await rescanFile(selectedFile.ID);
                }}
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
                <a href={`https://anidb.net/group/${ReleaseGroupID}`} target="_blank" rel="noopener noreferrer">
                  <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
                    <div className="metadata-link-icon AniDB" />
                    {ReleaseGroupName === null ? 'Unknown' : ReleaseGroupName}
                    <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
                  </div>
                </a>
              )}
              <div
                className="flex cursor-pointer items-center gap-x-2 text-panel-text-danger"
                onClick={() => {
                  setShowDeleteModal(true);
                  setSelectedFileToDelete(selectedFile);
                }}
              >
                <Icon path={mdiTrashCanOutline} size={1} />
                Delete File
              </div>

              {selectedFile.IsVariation && (
                <span className="ml-auto font-semibold text-panel-text-important">Variation</span>
              )}
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
        onConfirm={deleteFiles}
      />
    </div>
  );
};

export default EpisodeFiles;
