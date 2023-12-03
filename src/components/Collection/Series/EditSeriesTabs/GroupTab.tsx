import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { mdiCheckUnderlineCircleOutline, mdiCloseCircleOutline, mdiMagnify, mdiPencilCircleOutline } from '@mdi/js';
import cx from 'classnames';
import { debounce } from 'lodash';

import Input from '@/components/Input/Input';
import { useLazyGetGroupInfinitesQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';
import { useGetSeriesGroupQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';

import type { CollectionGroupType } from '@/core/types/api/collection';

type Props = {
  seriesId: number;
};

function GroupTab({ seriesId }: Props) {
  const [name, setName] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [nameEditable, setNameEditable] = useState<boolean>(false);

  const groupQuery = useGetSeriesGroupQuery({ seriesId: seriesId.toString(), topLevel: false }, {
    refetchOnMountOrArgChange: false,
  });

  const [fetchGroup, groupResults] = useLazyGetGroupInfinitesQuery();

  const getAniDbGroup = (): CollectionGroupType[] => {
    const pages = groupResults.data?.pages;
    if (!pages) return [];

    const keys = Object.keys(pages);
    if (!keys?.length) return [];

    return pages[1];
  };

  const searchGroup = useMemo(() =>
    debounce(async () => {
      await fetchGroup({
        startsWith: search?.length ? search : undefined,
        pageSize: 5,
      });
    }, 250), [search, fetchGroup]);

  useEffect(() => {
    searchGroup()?.then()?.catch(console.error);
  }, [search, searchGroup]);

  useEffect(() => {
    const { data } = groupQuery;
    setName(data?.Name ?? '');
  }, [groupQuery]);

  const renderTitle = useCallback((group: CollectionGroupType) => (
    <div
      className="flex cursor-pointer justify-between"
      key={group.IDs.MainSeries}
      onClick={() => setName(group.Name)}
    >
      <div>{group.Name}</div>
      {group.IDs.MainSeries}
    </div>
  ), []);

  const nameInputIcons = useCallback(() => {
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
  }, [nameEditable]);

  return (
    <div className="flex flex-col">
      <Input
        id="name"
        type="text"
        onChange={e => setName(e.target.value)}
        value={name}
        label="Name"
        className="mb-4"
        endIcons={nameInputIcons()}
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
        {!search && groupQuery.isSuccess && renderTitle(groupQuery.data)}
        {search && groupResults.isSuccess && getAniDbGroup().map(renderTitle)}
      </div>
    </div>
  );
}

export default GroupTab;
