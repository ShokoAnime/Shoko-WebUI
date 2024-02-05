import React from 'react';
import { Link } from 'react-router-dom';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
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
          className="h-[6rem] w-[4.4375rem] shrink-0 rounded-lg border border-panel-border drop-shadow-md"
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
  <div className="flex min-h-full overflow-hidden transition-all">
    <div className="ml-8 flex w-[26.125rem] grow flex-col gap-y-6 rounded-lg border border-panel-border bg-panel-background p-6">
      <div className="text-xl font-semibold">Timeline</div>
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
    </div>
  </div>
);

export default TimelineSidebar;
