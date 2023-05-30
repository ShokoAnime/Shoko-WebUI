import React, { useState } from 'react';
import { map } from 'lodash';
import Input from '@/components/Input/Input';
import { mdiChevronDown, mdiChevronUp, mdiMagnify } from '@mdi/js';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useParams } from 'react-router';
import { useGetSeriesTagsQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { Icon } from '@mdi/react';
import { TagType } from '@/core/types/api/tags';
import cx from 'classnames';

function SeriesTag(props: { item: TagType }) {
  const { item } = props;
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="rounded bg-background-alt/25 p-8 flex flex-col border-background-border border space-y-4 max-w-[29.875rem]" onClick={() => { setIsOpen(!isOpen); }}>
      <div className="text-xl font-semibold flex justify-between">{item.Name} <Icon path={isOpen ? mdiChevronUp : mdiChevronDown} size={1}/></div>
      <div className={cx('leading-5', { 'line-clamp-2': !isOpen })}>{item.Description}</div>
    </div>
  );
}

const SeriesTags = () => {
  const { seriesId } = useParams();
  if (!seriesId) {
    return null;
  }
  
  const [search, setSearch] = useState('');
  
  const tagsData = useGetSeriesTagsQuery({ seriesId });
  const tags = tagsData.data;
  
  return (
    <div className="flex space-x-8">
      <div className="grow-0 shrink-0 w-[22.375rem] flex flex-col align-top space-y-8">
        <div>
          <ShokoPanel title="Search & Filter" transparent>
            <div className="space-y-8">
              <Input id="search" label="Tag search" startIcon={mdiMagnify} type="text" placeholder="Search..." className="w-full bg-transparent" value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} />
            </div>
          </ShokoPanel>
        </div>
      </div>
      <div className="flex flex-col grow space-y-8">
        <div className="rounded bg-background-alt/25 px-8 py-4 flex justify-between items-center border-background-border border font-semibold text-xl">
          Tags
          <div><span className="text-highlight-2">{tags?.length || 0}</span> Tags Listed</div>
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