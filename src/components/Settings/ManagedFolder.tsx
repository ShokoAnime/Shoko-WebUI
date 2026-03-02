import React from 'react';
import { useDispatch } from 'react-redux';
import { mdiDatabaseEditOutline, mdiDatabaseSearchOutline } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import prettyBytes from 'pretty-bytes';

import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import { useRescanManagedFolderMutation } from '@/core/react-query/managed-folder/mutations';
import { setEdit } from '@/core/slices/modals/managedFolder';
import { formatThousand } from '@/core/util';

import type { ManagedFolderType } from '@/core/types/api/managed-folder';

export type ManagedFolderProps = {
  className?: string;
  folder: ManagedFolderType;
  index?: number;
};

const ManagedFolder = (props: ManagedFolderProps) => {
  const { className, index = 0, folder } = props;
  const dispatch = useDispatch();
  const { mutate: rescanManagedFolder } = useRescanManagedFolderMutation();

  let flags = '';

  if (folder.DropFolderType === 'Both') flags = 'Source, Destination';
  else if (folder.DropFolderType !== 'None') flags = folder.DropFolderType ?? '';

  if (folder.WatchForNewFiles) flags += flags ? ', Watch' : 'Watch';

  const handleRescan = () => {
    rescanManagedFolder(folder.ID, {
      onSuccess: () =>
        toast.success(
          'Scan Managed Folder Success',
          `Managed Folder ${folder.Name} queued for scanning.`,
        ),
    });
  };

  return (
    <React.Fragment key={folder.ID}>
      {index !== 0 && <div className="border-b border-panel-border" />}

      <div className={cx('flex flex-col', className)}>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold">{folder.Name}</span>
          <div className="flex gap-2">
            <Button onClick={handleRescan} tooltip="Rescan Folder">
              <Icon
                className="text-panel-icon-action"
                path={mdiDatabaseSearchOutline}
                size={1}
                horizontal
                vertical
                rotate={180}
              />
            </Button>
            <Button onClick={() => dispatch(setEdit(folder.ID))} tooltip="Edit Folder">
              <Icon
                className="text-panel-icon-action"
                path={mdiDatabaseEditOutline}
                size={1}
                horizontal
                vertical
                rotate={180}
              />
            </Button>
          </div>
        </div>
        <div className="mb-1 flex">
          <div className="grow">Location</div>
          <div title={folder.Path} className="line-clamp-1 pl-2">{folder.Path}</div>
        </div>
        <div className="mb-1 flex">
          <div className="grow">Type</div>
          <div>{flags !== '' ? flags : 'None'}</div>
        </div>
        <div className="flex">
          <div className="grow">Size</div>
          <div>
            {prettyBytes(folder.FileSize ?? 0, { binary: true })}
            &nbsp;(
            {formatThousand(folder.Size ?? 0)}
            &nbsp;Series)
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ManagedFolder;
