import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { mdiCheckUnderlineCircleOutline, mdiCloseCircleOutline, mdiPencilCircleOutline } from '@mdi/js';
import cx from 'classnames';
import { useToggle } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import { usePatchGroupMutation } from '@/core/react-query/group/mutations';
import { useGroupQuery, useGroupSeriesQuery } from '@/core/react-query/group/queries';

type Props = {
  groupId: number;
};

const NameTab = React.memo(({ groupId }: Props) => {
  const {
    data: groupData,
    isError: groupError,
    isFetching: groupFetching,
    isSuccess: groupSuccess,
  } = useGroupQuery(groupId);
  const {
    data: seriesData,
    isError: seriesError,
    isFetching: seriesFetching,
    isSuccess: seriesSuccess,
  } = useGroupSeriesQuery(groupId);

  const [groupName, setGroupName] = useState(groupData?.Name ?? '');
  useEffect(() => {
    setGroupName(groupData?.Name ?? '');
  }, [groupData?.Name]);

  const [nameEditable, toggleNameEditable] = useToggle(false);

  const { mutate: renameGroupMutation } = usePatchGroupMutation();
  const renameGroup = useCallback(() => {
    if (groupName !== groupData?.Name) {
      renameGroupMutation(
        {
          seriesId: 0, // Hack to avoid creating a new mutation...
          groupId,
          operations: [
            { op: 'replace', path: 'Name', value: groupName },
            { op: 'replace', path: 'HasCustomName', value: 'true' },
          ],
        },
      );
    }
    toggleNameEditable();
  }, [groupData?.Name, groupId, groupName, renameGroupMutation, toggleNameEditable]);

  const updateName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(event.target.value);
  };

  const resetName = useCallback(() => {
    toggleNameEditable();
    setGroupName(groupData?.Name ?? '');
  }, [groupData?.Name, toggleNameEditable]);

  const nameInputIcons = useMemo(() => {
    if (!nameEditable || groupFetching || seriesFetching) {
      return [{
        icon: mdiPencilCircleOutline,
        className: 'text-panel-text-primary',
        onClick: toggleNameEditable,
        tooltip: 'Edit name',
      }];
    }

    if (!(groupSuccess && seriesSuccess)) return [];

    return [
      {
        icon: mdiCloseCircleOutline,
        className: 'text-panel-text-danger',
        onClick: resetName,
        tooltip: 'Cancel',
      },
      {
        icon: mdiCheckUnderlineCircleOutline,
        className: 'text-panel-text-success',
        onClick: renameGroup,
        tooltip: 'Confirm',
      },
    ];
  }, [
    groupFetching,
    groupSuccess,
    nameEditable,
    renameGroup,
    resetName,
    seriesFetching,
    seriesSuccess,
    toggleNameEditable,
  ]);

  return (
    <div className="flex h-full flex-col">
      {(groupError || seriesError) && (
        <div className="m-auto text-lg font-semibold text-panel-text-danger">
          Group & Series data could not be loaded!
        </div>
      )}

      <Input
        id="group-name"
        type="text"
        onChange={updateName}
        value={groupName}
        placeholder={(groupFetching || seriesFetching) ? 'Loading...' : undefined}
        label="Name"
        className="mb-4"
        inputClassName={cx(nameInputIcons.length > 1 ? 'pr-[5rem]' : 'pr-12', 'truncate')}
        endIcons={nameInputIcons}
        disabled={!nameEditable}
      />
      {nameEditable && (
        <div className="flex cursor-pointer overflow-y-auto rounded-lg border border-panel-border bg-panel-input p-6">
          <div className="flex grow flex-col gap-y-2 overflow-y-auto bg-panel-input pr-4">
            {seriesData?.map(series => (
              <div
                className="flex justify-between transition-colors last:border-none hover:text-panel-text-primary"
                key={series.IDs.ID}
                onClick={() => setGroupName(series.Name)}
              >
                <div>{series.Name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default NameTab;
