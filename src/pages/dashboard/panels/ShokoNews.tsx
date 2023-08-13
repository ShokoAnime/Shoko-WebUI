import React from 'react';
import { useSelector } from 'react-redux';
import { mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import moment from 'moment';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useGetShokoNewsFeedQuery } from '@/core/rtkQuery/externalApi';

import type { RootState } from '@/core/store';
import type { DashboardNewsType } from '@/core/types/api/dashboard';

const newNewsCheck = (date: string) => {
  const itemDate = moment(date);
  const currentDate = moment();
  const differenceInDays = currentDate.diff(itemDate, 'days');
  return differenceInDays <= 14;
};

const NewsRow = ({ item }: { item: DashboardNewsType }) => (
  <div className="flex flex-col" key={item.title}>
    <div className="flex gap-x-4 font-semibold">
      <p>{item.date_published}</p>
      {newNewsCheck(item.date_published) && <p className="text-panel-important">New Post</p>}
    </div>
    <a
      href={item.link}
      rel="noopener noreferrer"
      target="_blank"
      className="mt-1 flex items-center space-x-2 font-semibold text-panel-primary hover:text-panel-primary-hover"
    >
      <p className="font-semibold">{item.title}</p>
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
        {items.data?.slice(0, 5).map(item => <NewsRow item={item} key={item.link} />)}
      </div>
    </ShokoPanel>
  );
}

export default ShokoNews;
