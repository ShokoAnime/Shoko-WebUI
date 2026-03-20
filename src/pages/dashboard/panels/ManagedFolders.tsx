import React from 'react';
import { mdiFolderPlusOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ManagedFolder from '@/components/Settings/ManagedFolder';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import { setStatus } from '@/core/slices/modals/managedFolder';
import { useDispatch, useSelector } from '@/core/store';

import type { ManagedFolderType } from '@/core/types/api/managed-folder';

const Options = ({ onClick }: { onClick: () => void }) => (
  <Button
    onClick={onClick}
    tooltip="Add Folder"
  >
    <Icon className="text-panel-icon-action" path={mdiFolderPlusOutline} size={1} />
  </Button>
);

const ManagedFolders = () => {
  const dispatch = useDispatch();
  const layoutEditMode = useSelector(state => state.mainpage.layoutEditMode);
  const managedFolderQuery = useManagedFoldersQuery();
  const managedFolders = managedFolderQuery?.data ?? [] as ManagedFolderType[];
  const setManagedFolderModalStatus = (status: boolean) => dispatch(setStatus(status));

  return (
    <ShokoPanel
      title="Managed Folders"
      options={<Options onClick={() => setManagedFolderModalStatus(true)} />}
      isFetching={managedFolderQuery.isPending}
      editMode={layoutEditMode}
      contentClassName={managedFolders.length > 2 && ('pr-4')}
    >
      {managedFolders.length === 0
        ? <div className="mt-4 flex justify-center font-semibold" key="no-folders">No Managed Folders Added!</div>
        : (
          <>
            <div className="border-b border-panel-border" />
            {managedFolders.map((folder, index) => (
              <ManagedFolder key={folder.ID} index={index} folder={folder} className="py-6" />
            ))}
          </>
        )}
    </ShokoPanel>
  );
};

export default ManagedFolders;
