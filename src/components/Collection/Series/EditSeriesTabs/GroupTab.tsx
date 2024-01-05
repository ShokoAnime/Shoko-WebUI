import React, { useEffect, useState } from 'react';
import { mdiCheckUnderlineCircleOutline, mdiCloseCircleOutline, mdiMagnify, mdiPencilCircleOutline } from '@mdi/js';
import cx from 'classnames';
import { useDebounce } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import { useGroupsInfiniteQuery } from '@/core/react-query/group/queries';
import { useSeriesGroupQuery } from '@/core/react-query/series/queries';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { CollectionGroupType } from '@/core/types/api/collection';

type Props = {
  seriesId: number;
};

const Title = ({ group }: { group: CollectionGroupType }) => (
  <div
    className="flex cursor-pointer justify-between"
    key={group.IDs.MainSeries}
    onClick={() => {}}
  >
    <div>{group.Name}</div>
    {group.IDs.MainSeries}
  </div>
);

function GroupTab({ seriesId }: Props) {
  const [name, setName] = useState('');
  const [nameEditable, setNameEditable] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);

  const groupQuery = useSeriesGroupQuery(seriesId, false);
  const groupsQuery = useGroupsInfiniteQuery({ startsWith: debouncedSearch, pageSize: 10 });
  const [groups] = useFlattenListResult(groupsQuery.data);

  useEffect(() => {
    if (groupQuery.isSuccess) setName(groupQuery.data.Name);
  }, [groupQuery.isSuccess, groupQuery.data?.Name]);

  const getNameInputIcons = () => {
    if (!nameEditable) {
      return [{
        icon: mdiPencilCircleOutline,
        className: 'text-panel-text-primary',
        onClick: () => setNameEditable(_ => true),
      }];
    }

    return [{
      icon: mdiCloseCircleOutline,
      className: 'text-red-500',
      onClick: () => setName(_ => ''),
    }, {
      icon: mdiCheckUnderlineCircleOutline,
      className: 'text-panel-text-primary',
      onClick: () => {}, // TODO: Need endpoint to update series
    }];
  };

  return (
    <div className="flex flex-col">
      <Input
        id="name"
        type="text"
        onChange={e => setName(e.target.value)}
        value={name}
        label="Name"
        className="mb-4"
        endIcons={getNameInputIcons()}
        disabled={!nameEditable}
      />
      <Input
        id="search"
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        startIcon={mdiMagnify}
        placeholder="Name Search..."
        disabled={!nameEditable}
        className={cx(!nameEditable && 'invisible')}
      />
      <div
        className={cx(
          'mt-1 flex flex-col gap-y-2.5 rounded-md border border-panel-border bg-panel-background-alt p-4',
          !nameEditable && 'invisible',
        )}
      >
        {!debouncedSearch && groupQuery.isSuccess && <Title group={groupQuery.data} />}
        {debouncedSearch && groupsQuery.isSuccess && groups.map(group => <Title key={group.IDs.ID} group={group} />)}
      </div>
    </div>
  );
}

export default GroupTab;
