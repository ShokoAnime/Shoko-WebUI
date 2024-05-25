import React, { useEffect, useMemo, useState } from 'react';
import {
  mdiCheckUnderlineCircleOutline,
  mdiCloseCircleOutline,
  mdiFolderMoveOutline,
  mdiFolderPlusOutline,
  mdiMagnify,
  mdiPencilCircleOutline,
} from '@mdi/js';
import Icon from '@mdi/react';
import { useDebounceValue } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import { useFilteredGroupsInfiniteQuery } from '@/core/react-query/filter/queries';
import {
  useCreateGroupMutation,
  useMoveGroupMutation,
  usePatchGroupMutation,
} from '@/core/react-query/group/mutations';
import { useSeriesGroupQuery } from '@/core/react-query/series/queries';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { FilterType } from '@/core/types/api/filter';

type Props = {
  seriesId: number;
};

type EndIcon = {
  icon: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  tooltip?: string;
};

type EditableNameComponentProps = {
  name: string;
  groupId: number;
  moveToNewGroup: () => void;
  renameGroup: ({ groupId, newName }: { groupId: number, newName: string }) => void;
};
const EditableNameComponent = React.memo(
  ({ groupId, moveToNewGroup, name, renameGroup }: EditableNameComponentProps) => {
    const [editingName, setEditingName] = useState(false);
    const [modifiableName, setModifiableName] = useState(name);

    useEffect(() => {
      setModifiableName(name);
    }, [name]);

    const cancelEditing = useEventCallback(() => {
      setModifiableName(() => {
        setEditingName(false);
        return name;
      });
    });

    const saveName = useEventCallback(() => {
      if (modifiableName !== name) {
        renameGroup({ groupId, newName: modifiableName });
      }
      setEditingName(false);
    });

    const endIcons: EndIcon[] = (!editingName)
      ? [
        {
          icon: mdiFolderPlusOutline,
          className: 'text-panel-text-primary',
          onClick: moveToNewGroup,
          tooltip: 'Move to new group',
        },
        {
          icon: mdiPencilCircleOutline,
          className: 'text-panel-text-primary',
          onClick: () => setEditingName(true),
          tooltip: 'Edit group name',
        },
      ]
      : [
        {
          icon: mdiCloseCircleOutline,
          className: 'text-red-500',
          onClick: cancelEditing,
          tooltip: 'Cancel',
        },
        {
          icon: mdiCheckUnderlineCircleOutline,
          className: 'text-panel-text-primary',
          onClick: saveName,
          tooltip: 'Rename group',
        },
      ];

    const updateInput = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      setModifiableName(event.target.value);
    });

    return (
      <Input
        id="group-name"
        type="text"
        value={modifiableName}
        onChange={updateInput}
        endIcons={endIcons}
        disabled={!editingName}
        inputClassName="pr-[4.5rem] truncate"
        className="mb-6"
      />
    );
  },
);

const ExistingGroup = React.memo((
  { group, moveToGroup }: { group: CollectionGroupType, moveToGroup: ({ groupId }: { groupId: number }) => void },
) => (
  <div className="flex w-full justify-between">
    <div
      className="line-clamp-1"
      data-tooltip-id="tooltip"
      data-tooltip-content={group.Name}
      data-tooltip-delay-show={500}
    >
      {group.Name}
    </div>
    <div
      className="cursor-pointer text-panel-icon-action"
      onClick={() => moveToGroup({ groupId: group.IDs.ParentGroup ?? group.IDs.TopLevelGroup })}
      data-tooltip-id="tooltip"
      data-tooltip-content="Move to group"
      data-tooltip-place="top"
    >
      <Icon path={mdiFolderMoveOutline} size={1} />
    </div>
  </div>
));

const getFilter = (query: string): FilterType => ((query === '') ? {} : {
  ApplyAtSeriesLevel: true,
  Expression: {
    Type: 'AnyContains',
    Left: { Type: 'NamesSelector' },
    Parameter: query,
  },
  Sorting: { Type: 'Name', IsInverted: false },
});

function GroupTab({ seriesId }: Props) {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 200);

  const updateSearch = useEventCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value));

  const { data: seriesGroup, isSuccess: isSeriesGroupSuccess } = useSeriesGroupQuery(seriesId, false);
  const groupsQuery = useFilteredGroupsInfiniteQuery({
    filterCriteria: getFilter(debouncedSearch),
    pageSize: 10,
  });
  const [groups] = useFlattenListResult(groupsQuery.data);

  const { mutate: moveToNewGroupMutation } = useCreateGroupMutation();
  const { mutate: moveToExistingGroupMutation } = useMoveGroupMutation();
  const { mutate: renameGroupMutation } = usePatchGroupMutation();

  const moveToNewGroup = useEventCallback(() => moveToNewGroupMutation({ seriesId }));
  const moveToExistingGroup = useEventCallback(({ groupId }: { groupId: number }) => {
    const currentGroupId = seriesGroup?.IDs?.ParentGroup ?? seriesGroup?.IDs.TopLevelGroup;
    if (currentGroupId && currentGroupId !== groupId) {
      moveToExistingGroupMutation({ seriesId, groupId });
    }
  });
  const renameGroup = useEventCallback(({ groupId, newName }: { groupId: number, newName: string }) => {
    renameGroupMutation(
      {
        seriesId,
        groupId,
        operations: [
          { op: 'replace', path: 'Name', value: newName },
          { op: 'replace', path: 'HasCustomName', value: 'true' },
        ],
      },
    );
  });

  const QueryStatusElement = useMemo(() => {
    if (groupsQuery.isLoading) {
      return <span className="my-auto self-center">Loading...</span>;
    }
    if (groupsQuery.isError) {
      return <span className="my-auto self-center">Error, please refresh!</span>;
    }
    return <span className="my-auto self-center">No Results!</span>;
  }, [groupsQuery.isError, groupsQuery.isLoading]);

  const GroupSearchComponent = useMemo(() => (
    <>
      <Input
        id="search"
        type="text"
        value={search}
        onChange={updateSearch}
        startIcon={mdiMagnify}
        placeholder="Group Search..."
      />
      <div className="mt-2 flex grow select-none overflow-y-auto rounded-lg border border-panel-border bg-panel-input p-6">
        <div className="shoko-scrollbar flex grow flex-col gap-y-2 overflow-y-auto bg-panel-input pr-3">
          {groups.length === 0
            ? QueryStatusElement
            : groups.map(group => (
              <ExistingGroup key={group.IDs.TopLevelGroup} group={group} moveToGroup={moveToExistingGroup} />
            ))}
        </div>
      </div>
    </>
  ), [QueryStatusElement, groups, moveToExistingGroup, search, updateSearch]);

  return (
    <div className="flex h-full flex-col">
      {isSeriesGroupSuccess && (
        <EditableNameComponent
          groupId={seriesGroup.IDs.ParentGroup ?? seriesGroup.IDs.TopLevelGroup}
          name={seriesGroup.Name}
          moveToNewGroup={moveToNewGroup}
          renameGroup={renameGroup}
        />
      )}
      {GroupSearchComponent}
    </div>
  );
}

export default GroupTab;
