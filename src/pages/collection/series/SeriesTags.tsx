import React, { useState } from 'react';
import { map } from 'lodash';
import { useParams } from 'react-router';
import { Icon } from '@mdi/react';
import { mdiChevronDown, mdiChevronUp, mdiMagnify } from '@mdi/js';
import cx from 'classnames';

import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useGetSeriesTagsQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { TagType } from '@/core/types/api/tags';

function SeriesTag(props: { item: TagType }) {
  const { item } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-md bg-panel-background-transparent p-8 flex flex-col border-panel-border border gap-y-4 max-w-[29.875rem] cursor-pointer" onClick={() => { setIsOpen(!isOpen); }}>
      <div className="text-xl font-semibold flex justify-between capitalize">{item.Name} <Icon path={isOpen ? mdiChevronUp : mdiChevronDown} size={1} /></div>
      <div className={cx('leading-5', { 'line-clamp-2': !isOpen })}>{item.Description}</div>
    </div>
  );
}

const SeriesTags = () => {
  const { seriesId } = useParams();

  const [search, setSearch] = useState('');

  const tagsData = useGetSeriesTagsQuery({ seriesId: seriesId! }, { skip: !seriesId });
  const tags = tagsData.data;

  if (!seriesId) return null;

  return (
    <div className="flex gap-x-8">
      <ShokoPanel title="Search & Filter" className="w-[25rem] sticky top-0 shrink-0 h-fit" transparent contentClassName="gap-y-8" fullHeight={false}>
        <Input id="search" label="Tag search" startIcon={mdiMagnify} type="text" placeholder="Search..." value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} />
      </ShokoPanel>

      <div className="flex flex-col grow gap-y-8">
        <div className="rounded-md bg-panel-background-transparent px-8 py-4 flex justify-between items-center border-panel-border border font-semibold text-xl">
          Tags
          <div><span className="text-panel-important">{tags?.length || 0}</span> Tags Listed</div>
        </div>
        <div className="grid grid-cols-3 gap-8">
          {map(tags, item => (
            <SeriesTag item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesTags;
