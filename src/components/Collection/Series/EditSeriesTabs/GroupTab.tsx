import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  mdiArrowRightThinCircleOutline,
  mdiCheckUnderlineCircleOutline,
  mdiCloseCircleOutline,
  mdiLoading,
  mdiMagnify,
  mdiPencilCircleOutline,
  mdiPlusCircleOutline,
} from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import { useDebounceValue } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import { useFilteredGroupsInfiniteQuery } from '@/core/react-query/filter/queries';
import {
  useCreateGroupMutation,
  useMoveGroupMutation,
  usePatchGroupMutation,
} from '@/core/react-query/group/mutations';
import { useSeriesGroupQuery } from '@/core/react-query/series/queries';
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
  loading: boolean;
  renameGroup: ({ groupId, newName }: { groupId: number, newName: string }) => void;
};
const EditableNameComponent = React.memo(
  ({ groupId, loading, name, renameGroup }: EditableNameComponentProps) => {
    const { t } = useTranslation('series');
    const [editingName, setEditingName] = useState(false);
    const [modifiableName, setModifiableName] = useState(name);

    useEffect(() => {
      setModifiableName(name);
    }, [name]);

    const cancelEditing = () => {
      setModifiableName(() => {
        setEditingName(false);
        return name;
      });
    };

    const saveName = () => {
      if (modifiableName !== name) {
        renameGroup({ groupId, newName: modifiableName });
      }
      setEditingName(false);
    };

    const endIcons: EndIcon[] = (!editingName)
      ? [
        {
          icon: mdiPencilCircleOutline,
          className: 'text-panel-text-primary',
          onClick: () => setEditingName(true),
          tooltip: t('group.editTooltip'),
        },
      ]
      : [
        {
          icon: mdiCloseCircleOutline,
          className: 'text-red-500',
          onClick: cancelEditing,
          tooltip: t('common.cancel'),
        },
        {
          icon: mdiCheckUnderlineCircleOutline,
          className: 'text-panel-text-primary',
          onClick: saveName,
          tooltip: t('group.renameTooltip'),
        },
      ];

    const updateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
      setModifiableName(event.target.value);
    };

    return (
      <Input
        id="group-name"
        type="text"
        value={modifiableName}
        onChange={updateInput}
        endIcons={endIcons}
        disabled={!editingName}
        placeholder={loading ? t('common.loading') : undefined}
        label={t('group.nameLabel')}
        inputClassName="pr-[4.5rem] truncate"
        className="mb-4"
      />
    );
  },
);

type ExistingGroupProps = {
  group: CollectionGroupType;
  moveToGroup: ({ groupId }: { groupId: number }) => void;
  moveToExistingTooltip: string;
};

const ExistingGroup = React.memo((
  { group, moveToExistingTooltip, moveToGroup }: ExistingGroupProps,
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
      data-tooltip-content={moveToExistingTooltip}
      data-tooltip-place="top"
    >
      <Icon path={mdiArrowRightThinCircleOutline} size={1} />
    </div>
  </div>
));

const getFilter = (query: string): FilterType => ((query === '') ? {} : {
  ApplyAtSeriesLevel: false,
  Expression: {
    Type: 'StringContains',
    Left: { Type: 'NameSelector' },
    Parameter: query,
  },
  Sorting: { Type: 'Name', IsInverted: false },
});

const GroupTab = ({ seriesId }: Props) => {
  const { t } = useTranslation('series');
  const i18nProps = {
    nameLabel: t('group.nameLabel'),
    loadingPlaceholder: t('common.loading'),
    editGroupTooltip: t('group.editTooltip'),
    cancelTooltip: t('common.cancel'),
    renameGroupTooltip: t('group.renameTooltip'),
    searchPlaceholder: t('group.searchPlaceholder'),
    moveToGroupLabel: t('group.moveToLabel'),
    createNewGroupTooltip: t('group.createNewTooltip'),
    noResults: t('group.noResults'),
    error: t('group.error'),
    moveToExistingTooltip: t('group.moveToExistingTooltip'),
  };
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 200);

  const updateSearch = (event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value);

  const { data: seriesGroup, isFetching } = useSeriesGroupQuery(seriesId, false);
  const groupsQuery = useFilteredGroupsInfiniteQuery({
    filterCriteria: getFilter(debouncedSearch),
    pageSize: 50,
  });
  const [groups, groupsResultSize] = useFlattenListResult(groupsQuery.data);

  const { mutate: moveToNewGroupMutation } = useCreateGroupMutation();
  const { mutate: moveToExistingGroupMutation } = useMoveGroupMutation();
  const { mutate: renameGroupMutation } = usePatchGroupMutation();

  const moveToNewGroup = () => moveToNewGroupMutation(seriesId);
  const moveToExistingGroup = ({ groupId }: { groupId: number }) => {
    const currentGroupId = seriesGroup?.IDs?.ParentGroup ?? seriesGroup?.IDs.TopLevelGroup;
    if (currentGroupId && currentGroupId !== groupId) {
      moveToExistingGroupMutation({ seriesId, groupId });
    }
  };
  const renameGroup = ({ groupId, newName }: { groupId: number, newName: string }) => {
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
  };

  return (
    <div className="flex h-full flex-col">
      <EditableNameComponent
        groupId={seriesGroup?.IDs.ParentGroup ?? seriesGroup?.IDs.TopLevelGroup ?? 0}
        loading={isFetching}
        name={seriesGroup?.Name ?? ''}
        renameGroup={renameGroup}
        {...i18nProps}
      />
      <Input
        id="search"
        type="text"
        value={search}
        onChange={updateSearch}
        startIcon={mdiMagnify}
        placeholder={i18nProps.searchPlaceholder}
        label={i18nProps.moveToGroupLabel}
        endIcons={[
          {
            icon: mdiPlusCircleOutline,
            className: 'text-panel-text-primary',
            onClick: moveToNewGroup,
            tooltip: i18nProps.createNewGroupTooltip,
          },
        ]}
      />
      <div className="mt-2 flex grow select-none overflow-y-auto rounded-lg border border-panel-border bg-panel-input p-6 pr-3">
        <div
          className={cx(
            'flex grow flex-col gap-y-2 overflow-y-auto bg-panel-input',
            groupsResultSize > 4 && 'pr-4',
          )}
        >
          {groupsQuery.isPending && (
            <Icon path={mdiLoading} size={3} className="my-auto self-center text-panel-text-primary" spin />
          )}

          {groupsQuery.isError && <span className="my-auto self-center text-panel-text-danger">{i18nProps.error}</span>}

          {groupsQuery.isSuccess && groups.length === 0 && (
            <span className="my-auto self-center">{i18nProps.noResults}</span>
          )}

          {groupsQuery.isSuccess && groups.length > 0 && (
            groups.map(group => (
              <ExistingGroup
                key={group.IDs.TopLevelGroup}
                group={group}
                moveToGroup={moveToExistingGroup}
                moveToExistingTooltip={i18nProps.moveToExistingTooltip}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupTab;
