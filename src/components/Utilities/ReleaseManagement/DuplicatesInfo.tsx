import React from 'react';
import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import { produce } from 'immer';
import { sortBy } from 'lodash';
import { useToggle } from 'usehooks-ts';

import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import { useDeleteFileLocationMutation } from '@/core/react-query/file/mutations';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import queryClient from '@/core/react-query/queryClient';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { ListResultType } from '@/core/types/api';
import type { EpisodeType } from '@/core/types/api/episode';
import type { FileLocationType, FileType } from '@/core/types/api/file';
import type { InfiniteData } from '@tanstack/react-query';

const getFileForLocation = (
  data: InfiniteData<ListResultType<EpisodeType>>,
  locationId: number,
) => {
  for (const page of data.pages) {
    for (const episode of page.List) {
      for (const file of episode.Files ?? []) {
        if (file?.Locations?.some(loc => loc.ID === locationId)) {
          return file;
        }
      }
    }
  }
  return undefined;
};

const handleSuccess = (locationId: number, seriesId: number) => {
  queryClient.setQueriesData<InfiniteData<ListResultType<EpisodeType>>>(
    { queryKey: ['release-management', 'series', 'episodes', 'DuplicateFiles', seriesId], type: 'active' },
    prevData =>
      produce(prevData, (draft) => {
        if (!draft) return;
        const file = getFileForLocation(draft, locationId);
        if (!file) return;

        const foundLocation = file.Locations.find(loc => loc.ID === locationId);
        if (!foundLocation) return;

        foundLocation.AbsolutePath = '';
        file.Locations = sortBy(file.Locations, [
          location => !location.AbsolutePath,
        ]);
      }),
  );
};

type Props = {
  file: FileType;
  handleEpisodeChange: (type: 'previous' | 'next') => void;
  location: FileLocationType;
  seriesId: number;
};

const DuplicatesInfo = (props: Props) => {
  const { file, handleEpisodeChange, location, seriesId } = props;

  const [confirmDelete, toggleConfirmDelete] = useToggle();

  const managedFoldersQuery = useManagedFoldersQuery();

  const { mutateAsync: deleteFileLocation } = useDeleteFileLocationMutation();

  const handleDelete = async () => {
    await deleteFileLocation({ locationId: location.ID })
      .then(() => {
        handleSuccess(location.ID, seriesId);
        // We check for `=== 2` here since we are checking stale data
        const oneLocationLeft = file.Locations.filter(fileLocation => !!fileLocation.AbsolutePath).length === 2;
        if (oneLocationLeft) handleEpisodeChange('next');
      });
  };

  // To re-enable the correct keybinds once the delete confirmation modal closes
  useToggleModalKeybinds(!confirmDelete, 'modal');

  const path = location.RelativePath ?? '';
  const match = /[/\\](?=[^/\\]*$)/g.exec(path);
  const relativePath = match ? path?.substring(0, match.index) : 'Root Level';
  const fileName = path?.split(/[/\\]/g).pop();
  const folderName = managedFoldersQuery.data?.find(
    folder => folder.ID === location.ManagedFolderID,
  )?.Name ?? '';
  const isDeleted = !location.AbsolutePath;

  return (
    <>
      <div
        key={file.ID}
        className={cx(
          'flex flex-col gap-2 rounded-lg border border-panel-border bg-panel-background-alt p-4 transition-colors',
          isDeleted && 'opacity-65',
        )}
        data-tooltip-id="tooltip"
        data-tooltip-content={isDeleted ? 'This file location is deleted' : ''}
        data-tooltip-place="top"
      >
        <div className="flex items-center justify-between">
          <div
            className="flex flex-col"
            data-tooltip-id="tooltip"
            data-tooltip-content={isDeleted ? '' : location.AbsolutePath}
            data-tooltip-delay-show={500}
          >
            <span className="line-clamp-1 text-sm font-semibold opacity-65">
              {folderName}
              &nbsp;-&nbsp;
              {relativePath}
            </span>
            <span className="line-clamp-1">
              {fileName}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              buttonType="danger"
              buttonSize="small"
              onClick={toggleConfirmDelete}
              tooltip={isDeleted ? '' : 'Delete'}
              disabled={isDeleted}
            >
              <Icon path={mdiTrashCanOutline} size={1} />
            </Button>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmationPromptModal
          onConfirm={handleDelete}
          onClose={toggleConfirmDelete}
          show={confirmDelete}
          title="Delete file location"
          confirmButtonType="danger"
          confirmText="Delete"
        >
          Do you want to delete the following file location?
          <div className="flex flex-col gap-1">
            <div className="text-sm opacity-65">
              {folderName}
              &nbsp;-&nbsp;
              {relativePath}
            </div>
            <div className="text-panel-text-important">
              {fileName}
            </div>
          </div>
        </ConfirmationPromptModal>
      )}
    </>
  );
};

export default DuplicatesInfo;
