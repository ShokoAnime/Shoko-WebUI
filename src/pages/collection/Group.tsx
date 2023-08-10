import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { mdiEyeArrowRightOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useGetGroupSeriesQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';
import useMainPoster from '@/hooks/useMainPoster';

import type { RootState } from '@/core/store';
import type { SeriesType } from '@/core/types/api/series';

const HoverIcon = ({ icon, label, route }) => (
  <Link to={route}>
    <div className="my-2 flex flex-col items-center justify-items-center">
      <div className="mb-2 inline-block shrink rounded-full bg-panel-background p-4 text-panel-primary">
        <Icon path={icon} size={1} />
      </div>
      <span className="font-semibold">{label}</span>
    </div>
  </Link>
);

const SeriesDetails = ({ item }: { item: SeriesType }) => {
  const mainPoster = useMainPoster(item);
  return (
    <div key={`series-${item.IDs.ID}`} className="group mr-4 flex w-56 shrink-0 flex-col content-center last:mr-0">
      <BackgroundImagePlaceholderDiv
        image={mainPoster}
        className="my-2 h-72 rounded border border-panel-border drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
      >
        <div className="hidden h-full flex-col items-center justify-center bg-overlay-background group-hover:flex">
          <HoverIcon
            icon={mdiEyeArrowRightOutline}
            label="View Series"
            route={`/webui/collection/series/${item.IDs.ID}`}
          />
        </div>
      </BackgroundImagePlaceholderDiv>
      <p className="text-center text-base font-semibold" title={item.Name}>{item.Name}</p>
    </div>
  );
};

const Group = () => {
  const { groupId } = useParams();
  const groups = useSelector((state: RootState) => state.collection.groups);
  const group = useMemo(() => groups.find(item => `${item.IDs.ID}` === groupId), [groupId, groups]);
  const series = useGetGroupSeriesQuery({ groupId });
  const seriesInGroup = useMemo(() => series?.data ?? [] as Array<SeriesType>, [series?.data]);

  const renderTitle = useCallback((count: number) => (
    <>
      <Link className="text-panel-primary" to="/webui/collection">Entire Collection</Link>
      <span className="px-2">&gt;</span>
      {group?.Name}
      <span className="px-2">|</span>
      <span className="text-panel-important">
        {count}
        &nbsp;Items
      </span>
    </>
  ), [group]);

  return (
    <div className="h-full min-w-full">
      <ShokoPanel title={renderTitle(seriesInGroup.length)}>
        <div className="flex flex-wrap gap-x-2">
          {seriesInGroup.map(item => <SeriesDetails item={item} />)}
        </div>
      </ShokoPanel>
    </div>
  );
};

export default React.memo(Group);
