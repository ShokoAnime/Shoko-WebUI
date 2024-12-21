import React, { useMemo } from 'react';
import { mdiMagnify, mdiPlayCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';

import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useRefreshSeriesAniDBInfoMutation } from '@/core/react-query/series/mutations';
import useEventCallback from '@/hooks/useEventCallback';

import type { TagType } from '@/core/types/api/tags';

type Props = {
  search: string;
  tagSourceFilter: Set<string>;
  showSpoilers: boolean;
  seriesId: number;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  toggleSort: () => void;
  sort: boolean;
};
const TagsSearchAndFilterPanel = React.memo(
  ({ handleInputChange, search, seriesId, showSpoilers, sort, tagSourceFilter, toggleSort }: Props) => {
    const { isPending: anidbRefreshPending, mutate: refreshAnidb } = useRefreshSeriesAniDBInfoMutation(seriesId);
    const refreshAnidbCallback = useEventCallback(() => {
      refreshAnidb({ force: true });
    });

    const searchInput = useMemo(() => (
      <Input
        id="search"
        label="Tag Search"
        startIcon={mdiMagnify}
        type="text"
        placeholder="Search..."
        value={search}
        onChange={handleInputChange}
      />
    ), [handleInputChange, search]);
    const tagSources = useMemo(() => (
      <div className="flex flex-col gap-y-2">
        <div className="text-base font-bold">Tag Source</div>
        <div className="flex flex-col gap-y-2 rounded-lg bg-panel-input p-6">
          {['AniDB', 'User'].map((tagSource: TagType['Source']) => (
            <Checkbox
              justify
              label={tagSource}
              key={tagSource}
              id={tagSource}
              isChecked={!tagSourceFilter.has(tagSource)}
              onChange={handleInputChange}
            />
          ))}
        </div>
      </div>
    ), [handleInputChange, tagSourceFilter]);
    const spoilers = useMemo(() => (
      <div className="flex flex-col gap-x-2">
        <div className="text-base font-bold">Display</div>
        <Checkbox
          id="show-spoilers"
          label="Show Spoiler Tags"
          isChecked={showSpoilers}
          onChange={handleInputChange}
          justify
        />
      </div>
    ), [handleInputChange, showSpoilers]);
    const sortAction = useMemo(() => (
      <button
        type="button"
        className="flex w-full flex-row justify-between"
        onClick={toggleSort}
      >
        Change Sort |&nbsp;
        {sort ? 'Tag Weight' : 'A-Z'}
        <Icon
          path={mdiPlayCircleOutline}
          className="pointer-events-auto text-panel-icon-action"
          size={1}
        />
      </button>
    ), [sort, toggleSort]);
    const forceRefreshAnidbData = useMemo(() => (
      <button
        type="button"
        className="flex w-full flex-row justify-between disabled:cursor-not-allowed disabled:opacity-65"
        onClick={refreshAnidbCallback}
        disabled={anidbRefreshPending}
      >
        Force refresh: AniDB
        <Icon
          path={mdiPlayCircleOutline}
          className="pointer-events-auto text-panel-icon-action group-disabled:cursor-not-allowed"
          size={1}
        />
      </button>
    ), [anidbRefreshPending, refreshAnidbCallback]);
    return (
      <div className="flex w-100 shrink-0 flex-col gap-y-6">
        <ShokoPanel
          title="Search & Filter"
          className="w-full"
          contentClassName="gap-y-6"
          fullHeight={false}
          sticky
          transparent
        >
          {searchInput}
          {tagSources}
          {spoilers}
          <div className="flex flex-col gap-2">
            <div className="text-base font-bold">Quick Actions</div>
            {sortAction}
            {forceRefreshAnidbData}
          </div>
        </ShokoPanel>
      </div>
    );
  },
);

export default TagsSearchAndFilterPanel;
