import React, { useState } from 'react';
import { useParams } from 'react-router';
import { mdiChevronDown, mdiChevronUp, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { map, toNumber } from 'lodash';

import AnidbDescription from '@/components/Collection/AnidbDescription';
import Input from '@/components/Input/Input';
import { useSeriesTagsQuery } from '@/core/react-query/series/queries';

import type { TagType } from '@/core/types/api/tags';

function SeriesTag(props: { item: TagType }) {
  const { item } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="flex max-w-[29.875rem] cursor-pointer flex-col gap-y-4 rounded-md border border-panel-border bg-panel-background-transparent p-8"
      onClick={() => {
        setIsOpen(!isOpen);
      }}
    >
      <div className="flex justify-between text-xl font-semibold capitalize">
        {item.Name}
        &nbsp;
        <Icon path={isOpen ? mdiChevronUp : mdiChevronDown} size={1} />
      </div>
      <div className={cx('leading-5', { 'line-clamp-2': !isOpen })}>
        <AnidbDescription text={item?.Description || 'No description set.'} />
      </div>
    </div>
  );
}

const SeriesTags = () => {
  const { seriesId } = useParams();

  const [search, setSearch] = useState('');

  const tagsQuery = useSeriesTagsQuery(toNumber(seriesId!), {}, !!seriesId);

  if (!seriesId) return null;

  return (
    <>
      <div className="flex items-center gap-y-8 rounded-md border border-panel-border bg-panel-background-transparent p-8">
        <div className="flex w-full text-xl font-semibold">Tag Search</div>
        <Input
          id="search"
          startIcon={mdiMagnify}
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
        />
      </div>
      <div className="flex gap-x-8">
        <div className="flex grow flex-col gap-y-8">
          <div className="flex items-center justify-between rounded-md border border-panel-border bg-panel-background-transparent px-8 py-4 text-xl font-semibold">
            Tags
            <div>
              <span className="text-panel-text-important">{tagsQuery.data?.length || 0}</span>
              &nbsp;Tags Listed
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {map(tagsQuery.data ?? [], item => <SeriesTag key={item.ID} item={item} />)}
          </div>
        </div>
      </div>
    </>
  );
};

export default SeriesTags;
