import React from 'react';
import { Link } from 'react-router';

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
    <div className="flex gap-x-3" key={series.IDs.ID}>
      <Link to={`/webui/collection/series/${series.IDs.ID}`}>
        <BackgroundImagePlaceholderDiv
          image={mainPoster}
          className="group h-24 w-[4.4375rem] shrink-0 rounded-lg border border-panel-border drop-shadow-md"
          overlayOnHover
          zoomOnHover
        />
      </Link>
      <div className="flex flex-col font-semibold">
        <div className="flex gap-y-2">
          {dayjs(series.AniDB?.AirDate).year()}
          &nbsp;|&nbsp;
          <div className="text-panel-text-important">{seriesType}</div>
        </div>
        <div className="line-clamp-2">
          <Link
            to={`/webui/collection/series/${series.IDs.ID}`}
            className="transition-colors hover:text-panel-text-primary"
            data-tooltip-id="tooltip"
            data-tooltip-content={series.Name}
          >
            {series.Name}
          </Link>
        </div>
      </div>
    </div>
  );
};

const TimelineSidebar = ({ isFetching, series }: { isFetching: boolean, series: SeriesType[] }) => (
  <ShokoPanel
    title="Timeline"
    className="sticky top-24 ml-6 !h-[calc(100vh-18rem)] w-[26.5rem]"
    contentClassName="gap-y-3"
    isFetching={isFetching}
  >
    {series.map(item => <TimelineItem series={item} key={item.IDs.ID} />)}
  </ShokoPanel>
);

export default TimelineSidebar;
