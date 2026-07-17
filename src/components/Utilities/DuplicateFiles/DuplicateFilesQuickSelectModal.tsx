import React, { useEffect, useMemo } from 'react';
import { forEach, map, toNumber } from 'lodash';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useDeleteFileLocationsMutation } from '@/core/react-query/file/mutations';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import { resetQueries } from '@/core/react-query/queryClient';
import { useSeriesFileSummaryQuery } from '@/core/react-query/webui/queries';
import toast from '@/core/toast';

import type { ManagedFolderType } from '@/core/types/api/managed-folder';

type Props = {
  show: boolean;
  onClose: () => void;
  seriesId: number;
};

const DuplicateFilesQuickSelectModal = ({ onClose, seriesId, show }: Props) => {
  const fileSummaryQuery = useSeriesFileSummaryQuery(
    seriesId,
    {
      groupBy: 'ManagedFolder,FileLocation,MultipleLocations',
      includeEpisodeDetails: true,
      includeLocationDetails: true,
    },
    show,
  );
  const fileSummary = fileSummaryQuery.data;

  const managedFoldersQuery = useManagedFoldersQuery();
  const managedFolders = useMemo<Record<number, ManagedFolderType>>(() => {
    const result = {};

    forEach(managedFoldersQuery.data, (folder) => {
      result[folder.ID] = folder;
    });

    return result;
  }, [managedFoldersQuery.data]);

  const { isPending: isDeletingLocations, mutate: deleteLocations } = useDeleteFileLocationsMutation();

  const [groupsToDelete, setGroupsToDelete] = useImmer<Set<number>>(new Set());

  useEffect(() => {
    setGroupsToDelete(new Set());
  }, [setGroupsToDelete, show]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const index = toNumber(event.target.id.split('-')[1]);
    setGroupsToDelete((state) => {
      if (event.target.checked) state.add(index);
      else state.delete(index);
    });
  };

  const handleConfirm = () => {
    const locationIds = map(
      [...groupsToDelete],
      groupIndex =>
        map(
          fileSummary?.Groups[groupIndex].Locations,
          location => location.ID,
        ),
    ).flat();

    deleteLocations(
      { locationIds, removeFolder: true },
      {
        onSuccess: () => {
          resetQueries(['release-management']);
          toast.success(
            `${locationIds.length} ${locationIds.length === 1 ? 'duplicate file' : 'duplicate files'} deleted!`,
          );
          onClose();
        },
        onError: () => toast.error('Duplicate files could not be deleted!'),
      },
    );
  };

  return (
    <ModalPanel show={show} onRequestClose={onClose} header="Quick Select" size="sm">
      {fileSummaryQuery.isSuccess && (
        map(
          fileSummary?.Groups,
          (group, index) => {
            const managedFolder = managedFolders[group.ManagedFolder!];

            return (
              <div key={`group-${index}`} className="flex items-center justify-between gap-x-3">
                <div className="flex flex-col gap-y-1">
                  <div className="font-semibold">
                    Managed Folder:&nbsp;
                    {`${managedFolder.Name} (ID: ${managedFolder.ID})`}
                  </div>
                  <div className="flex flex-wrap text-sm break-all opacity-65">
                    Location:&nbsp;
                    {group.FileLocation?.replace(managedFolder.Path, '')}
                  </div>
                  <div className="flex flex-wrap text-sm opacity-65">
                    {group.Episodes?.length}
                    &nbsp;Episodes
                    {group.RangeByType.Episode && (
                      <>
                        &nbsp;(
                        {group.RangeByType.Episode.Range}
                        )
                      </>
                    )}
                  </div>
                </div>
                <Checkbox
                  id={`checkbox-${index}`}
                  isChecked={groupsToDelete.has(index)}
                  onChange={handleCheckboxChange}
                  label="Delete"
                />
              </div>
            );
          },
        )
      )}

      <div className="mt-4 flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-6 py-2">Cancel</Button>
        <Button
          onClick={handleConfirm}
          buttonType="primary"
          className="px-6 py-2"
          loading={isDeletingLocations}
        >
          Confirm
        </Button>
      </div>
    </ModalPanel>
  );
};

export default DuplicateFilesQuickSelectModal;
