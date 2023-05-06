import React from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@mdi/react';
import { mdiOpenInNew } from '@mdi/js';

import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import { DashboardNewsType } from '../../../core/types/api/dashboard';

import { useGetShokoNewsFeedQuery } from '../../../core/rtkQuery/externalApi';

function ShokoNews() {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const items = useGetShokoNewsFeedQuery();

  const renderRow = (item: DashboardNewsType) => (
    <div className="flex flex-col space-y-1 mt-1 first:mt-0" key={item.title}>
        <p className="text-base font-semibold opacity-75">{item.date_published}</p>
        <p className="text-base font-semibold">{item.title}</p>
      <div className="flex gap-x-2 text-highlight-1 font-semibold">
        <a href={item.link} rel="noopener,noreferrer" target="_blank">Read More</a>
        <Icon path={mdiOpenInNew} size={1} />
      </div>
    </div>
  );

  return (
    <ShokoPanel title="Shoko News" isFetching={items.isLoading} editMode={layoutEditMode}>
      <div className="flex flex-col space-y-3">
        {items.data?.slice(0, 4).map(item => renderRow(item))}
      </div>
    </ShokoPanel>
  );
}

export default ShokoNews;
