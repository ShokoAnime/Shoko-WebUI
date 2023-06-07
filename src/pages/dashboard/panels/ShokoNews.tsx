import React from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@mdi/react';
import { mdiOpenInNew } from '@mdi/js';

import { RootState } from '@/core/store';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { DashboardNewsType } from '@/core/types/api/dashboard';

import { useGetShokoNewsFeedQuery } from '@/core/rtkQuery/externalApi';

const NewsRow = ({ item }: { item: DashboardNewsType }) => (
  <div className="flex flex-col gap-y-1" key={item.title}>
    <p className="font-semibold opacity-75">{item.date_published}</p>
    <p className="font-semibold">{item.title}</p>
    <a href={item.link} rel="noopener noreferrer" target="_blank" className="flex gap-x-2 text-highlight-1 font-semibold items-center mt-1">
      Read More
      <Icon path={mdiOpenInNew} size={1} />
    </a>
  </div>
);

function ShokoNews() {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const items = useGetShokoNewsFeedQuery();

  return (
    <ShokoPanel title="Shoko News" isFetching={items.isLoading} editMode={layoutEditMode}>
      <div className="flex flex-col gap-y-3">
        {items.data?.slice(0, 4).map(item => <NewsRow item={item} key={item.link} />)}
      </div>
    </ShokoPanel>
  );
}

export default ShokoNews;
