import React, { useEffect, useMemo } from 'react';
import { forEach, map, toNumber } from 'lodash';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { useDeleteFileLocationsMutation, useDeleteFilesMutation } from '@/core/react-query/file/mutations';
import { useImportFoldersQuery } from '@/core/react-query/import-folder/queries';
import { resetQueries } from '@/core/react-query/queryClient';
import { ReleaseManagementItemType } from '@/core/react-query/release-management/types';
import { useSeriesFileSummaryQuery } from '@/core/react-query/webui/queries';

import type { ImportFolderType } from '@/core/types/api/import-folder';

type Props = {
  show: boolean;
  onClose: () => void;
  seriesId: number;
  type: ReleaseManagementItemType;
};

const QuickSelectModal = ({ onClose, seriesId, show, type }: Props) => {
  const fileSummaryQuery = useSeriesFileSummaryQuery(
    seriesId,
    {
      groupBy: type === ReleaseManagementItemType.MultipleReleases
        ? 'GroupName,FileSource,FileVersion,ImportFolder,VideoCodecs,VideoResolution,AudioLanguages,SubtitleLanguages,VideoHasChapters'
        : 'ImportFolder,FileLocation,MultipleLocations',
      includeEpisodeDetails: true,
      includeLocationDetails: type === ReleaseManagementItemType.DuplicateFiles,
    },
    show,
  );
  const fileSummary = fileSummaryQuery.data;

  const importFoldersQuery = useImportFoldersQuery();
  const importFolders = useMemo<Record<number, ImportFolderType>>(() => {
    const result = {};

    forEach(importFoldersQuery.data, (folder) => {
      result[folder.ID] = folder;
    });

    return result;
  }, [importFoldersQuery]);

  const { isPending: isDeletingFiles, mutate: deleteFiles } = useDeleteFilesMutation();
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
    if (type === ReleaseManagementItemType.MultipleReleases) {
      const fileIds = map(
        [...groupsToDelete],
        groupIndex =>
          map(
            fileSummary?.Groups[groupIndex].Episodes,
            episode => episode.FileID,
          ),
      ).flat();

      deleteFiles(
        { fileIds, removeFolder: true },
        {
          onSuccess: () => {
            resetQueries(['release-management']);
            toast.success(`${fileIds.length} ${fileIds.length === 1 ? 'file' : 'files'} deleted!`);
            onClose();
          },
          onError: () => toast.error('Files could not be deleted!'),
        },
      );

      return;
    }

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
            const importFolder = importFolders[group.ImportFolder!];

            return (
              <div key={`group-${index}`} className="flex items-center justify-between gap-x-3">
                <div className="flex flex-col gap-y-1">
                  {type === ReleaseManagementItemType.DuplicateFiles && (
                    <>
                      <div className="font-semibold">
                        Import Folder:&nbsp;
                        {`${importFolder.Name} (ID: ${importFolder.ID})`}
                      </div>
                      <div className="flex flex-wrap break-all text-sm opacity-65">
                        Location:&nbsp;
                        {group.FileLocation?.replace(importFolder.Path, '')}
                      </div>
                      <div className="flex flex-wrap text-sm opacity-65">
                        {group.Episodes?.length}
                        &nbsp;Episodes
                        {group.RangeByType.Normal && (
                          <>
                            &nbsp;(
                            {group.RangeByType.Normal.Range}
                            )
                          </>
                        )}
                      </div>
                    </>
                  )}

                  {type === ReleaseManagementItemType.MultipleReleases && (
                    <>
                      <div className="font-semibold">
                        {group.GroupName === 'None' ? 'Manual link' : group.GroupName}
                        &nbsp;-&nbsp;
                        {group.Episodes?.length}
                        &nbsp;Episodes
                        {group.RangeByType.Normal && (
                          <>
                            &nbsp;(
                            {group.RangeByType.Normal.Range}
                            )
                          </>
                        )}
                        &nbsp;-&nbsp;
                        {`v${group.FileVersion}`}
                      </div>
                      <div className="flex flex-wrap text-sm opacity-65">
                        Import Folder:&nbsp;
                        {`${importFolder.Name} (ID: ${importFolder.ID})`}
                      </div>
                      <div className="flex flex-wrap text-sm opacity-65">
                        {group.FileSource}
                        &nbsp;|&nbsp;
                        {group.VideoCodecs?.toUpperCase()}
                        &nbsp;|&nbsp;
                        {group.VideoResolution}
                        {group.AudioLanguages && (
                          <>
                            &nbsp;|&nbsp;
                            <div>
                              {group.AudioLanguages.length === 0 ? 'No Audio' : (
                                <>
                                  {group.AudioLanguages.length > 1 ? 'Multi ' : 'Single '}
                                  Audio (
                                  {group.AudioLanguages.join(', ')}
                                  )
                                </>
                              )}
                            </div>
                          </>
                        )}
                        {group.SubtitleLanguages && (
                          <>
                            &nbsp;|&nbsp;
                            <div>
                              {group.SubtitleLanguages.length === 0 ? 'No Subs' : (
                                <>
                                  {group.SubtitleLanguages.length > 1 ? 'Multi ' : 'Single '}
                                  Subs (
                                  {group.SubtitleLanguages.join(', ')}
                                  )
                                </>
                              )}
                            </div>
                          </>
                        )}
                        {group.VideoHasChapters && (
                          <>
                            &nbsp;|&nbsp;
                            <div>Chaptered</div>
                          </>
                        )}
                      </div>
                    </>
                  )}
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
          loading={isDeletingFiles || isDeletingLocations}
        >
          Confirm
        </Button>
      </div>
    </ModalPanel>
  );
};

export default QuickSelectModal;
