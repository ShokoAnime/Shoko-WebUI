import React from 'react';
import { Link } from 'react-router-dom';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { SeriesTypeEnum } from '@/core/types/api/series';
import { dayjs } from '@/core/util';
import useMainPoster from '@/hooks/useMainPoster';

import type { SeriesType } from '@/core/types/api/series';

const TimelineItem = ({ series }: { series: SeriesType }) => {
  const mainPoster = useMainPoster(series);
  const seriesType = series.AniDB?.Type === SeriesTypeEnum.TVSpecial
    ? 'TV Special'
    : series.AniDB?.Type;

  return (
    <Link to={`/webui/collection/series/${series.IDs.ID}`}>
      <div className="flex gap-x-3" key={series.IDs.ID}>
        <BackgroundImagePlaceholderDiv
          image={mainPoster}
          className="h-24 w-[4.4375rem] shrink-0 rounded-lg border border-panel-border drop-shadow-md"
        />
        <div className="flex flex-col font-semibold">
          <div className="flex gap-y-2">
            {dayjs(series.AniDB?.AirDate).year()}
            &nbsp;|&nbsp;
            <div className="text-panel-text-important">{seriesType}</div>
          </div>
          <div className="line-clamp-2">{series.Name}</div>
        </div>
      </div>
    </Link>
  );
};

const TimelineSidebar = ({ isFetching, series }: { isFetching: boolean, series: SeriesType[] }) => (
  <ShokoPanel
    title="Timeline"
    className="sticky top-24 ml-6 !h-[calc(100vh-18rem)] w-[26.5rem]"
    contentClassName="gap-y-6"
  >
    {isFetching
      ? (
        <div className="flex grow items-center justify-center text-panel-text-primary">
          <Icon path={mdiLoading} size={3} spin />
        </div>
      )
      : (
        <div className="flex flex-col gap-y-3">
          {series.map(item => <TimelineItem series={item} key={item.IDs.ID} />)}
        </div>
      )}
  </ShokoPanel>
);

export default TimelineSidebar;
