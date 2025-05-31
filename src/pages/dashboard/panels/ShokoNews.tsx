import React from 'react';
import { useSelector } from 'react-redux';
import { mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

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

const NewsRow = ({ item }: { item: DashboardNewsType }) => {
  const { shokoNewsPostsCount } = useSettingsQuery().data.WebUI_Settings.dashboard;
  const newsUrl = `https://shokoanime.com/blog/${item.filename.replace('.mdx', '')}`;

  return (
    <div className="flex flex-col gap-y-1" key={item.meta.title}>
      <div className={cx('flex gap-x-4 justify-between font-semibold', shokoNewsPostsCount > 4 && ('mr-4'))}>
        <p>{item.meta.date}</p>
        {newNewsCheck(item.meta.date) && <p className="text-panel-text-important">New!</p>}
      </div>
      <a
        href={newsUrl}
        rel="noopener noreferrer"
        target="_blank"
        className="flex items-center space-x-2 font-semibold text-panel-icon-action"
      >
        <p className="line-clamp-1 max-w-[350px] font-semibold">{item.meta.title}</p>
        <Icon path={mdiOpenInNew} size={1} />
      </a>
      <p className="text-sm opacity-65">{item.meta.quick}</p>
    </div>
  );
};

const ShokoNews = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);
  const newsQuery = useShokoNewsQuery();
  const { shokoNewsPostsCount } = useSettingsQuery().data.WebUI_Settings.dashboard;

  return (
    <ShokoPanel title="Shoko News" isFetching={newsQuery.isPending} editMode={layoutEditMode}>
      <div className="mr-3 flex flex-col gap-y-4">
        {newsQuery.data?.slice(0, shokoNewsPostsCount).map(item => <NewsRow item={item} key={item.meta.title} />)}
      </div>
    </ShokoPanel>
  );
};

export default ShokoNews;
