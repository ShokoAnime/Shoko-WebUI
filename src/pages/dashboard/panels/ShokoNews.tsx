import React from 'react';
import { useSelector } from 'react-redux';
import { mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useShokoNewsQuery } from '@/core/react-query/external/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { dayjs } from '@/core/util';

import type { RootState } from '@/core/store';
import type { DashboardNewsType } from '@/core/types/api/dashboard';

const newNewsCheck = (date: string) => {
  const differenceInDays = dayjs().diff(dayjs(date), 'day');
  return differenceInDays <= 14;
};

const NewsRow = ({ item }: { item: DashboardNewsType }) => (
  <div className="flex flex-col" key={item.title}>
    <div className="flex gap-x-4 font-semibold">
      <p>{item.date_published}</p>
      {newNewsCheck(item.date_published) && <p className="text-panel-text-important">New Post</p>}
    </div>
    <a
      href={item.link}
      rel="noopener noreferrer"
      target="_blank"
      className="mt-1 flex items-center space-x-2 font-semibold text-panel-icon-action"
    >
      <p className="font-semibold">{item.title}</p>
      <Icon path={mdiOpenInNew} size={1} />
    </a>
  </div>
);

function ShokoNews() {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const newsQuery = useShokoNewsQuery();

  const { shokoNewsPostsCount } = useSettingsQuery().data.WebUI_Settings.dashboard;

  return (
    <ShokoPanel title="Shoko News" isFetching={newsQuery.isPending} editMode={layoutEditMode}>
      <div className="flex flex-col gap-y-3">
        {newsQuery.data?.slice(0, shokoNewsPostsCount).map(item => <NewsRow item={item} key={item.link} />)}
      </div>
    </ShokoPanel>
  );
}

export default ShokoNews;
