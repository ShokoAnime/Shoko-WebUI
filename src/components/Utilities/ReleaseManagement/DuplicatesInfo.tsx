import React, { useState } from 'react';
import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';

import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import { useDeleteFileLocationMutation } from '@/core/react-query/file/mutations';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import { invalidateQueries } from '@/core/react-query/queryClient';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { FileLocationType, FileType } from '@/core/types/api/file';

type Props = {
  file: FileType;
  location: FileLocationType;
};

const DuplicatesInfo = ({ file, location }: Props) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const managedFoldersQuery = useManagedFoldersQuery();

  const { mutateAsync: deleteFileLocation } = useDeleteFileLocationMutation();

  const handleDelete = async () => {
    if (!confirmDelete) return;

    await deleteFileLocation({ locationId: location.ID });
    invalidateQueries(['release-management', 'series', 'episodes']);
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
            className="line-clamp-1 flex flex-col"
            data-tooltip-id="tooltip"
            data-tooltip-content={isDeleted ? '' : location.AbsolutePath}
            data-tooltip-delay-show={500}
          >
            <span className="line-clamp-1 truncate text-sm font-semibold opacity-65">
              {folderName}
              &nbsp;-&nbsp;
              {relativePath}
            </span>
            <span className="line-clamp-1 truncate">
              {fileName}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              buttonType="danger"
              buttonSize="small"
              onClick={() => setConfirmDelete(true)}
              tooltip={isDeleted ? '' : 'Delete'}
              disabled={isDeleted}
            >
              <Icon path={mdiTrashCanOutline} size={1} />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationPromptModal
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
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
    </>
  );
};

export default DuplicatesInfo;
