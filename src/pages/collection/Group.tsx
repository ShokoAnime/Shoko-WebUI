import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { mdiEyeArrowRightOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import { useGetGroupSeriesQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';
import ShokoPanel from '@/components/Panels/ShokoPanel';

import { RootState } from '@/core/store';
import type { SeriesType } from '@/core/types/api/series';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import useMainPoster from '@/hooks/useMainPoster';

const HoverIcon = ({ icon, label, route }) => (
  <Link to={route}>
    <div className="flex flex-col justify-items-center items-center my-2">
      <div className="bg-panel-background rounded-full inline-block shrink p-4 text-panel-primary mb-2">
        <Icon path={icon} size={1} />
      </div>
      <span className="font-semibold">{label}</span>
    </div>
  </Link>
);

const SeriesDetails = ({ item }: { item: SeriesType }) => {
  const mainPoster = useMainPoster(item);
  return (
    <div key={`series-${item.IDs.ID}`} className="group mr-4 last:mr-0 shrink-0 w-56 content-center flex flex-col">
      <BackgroundImagePlaceholderDiv image={mainPoster} className="h-72 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-panel-border my-2">
        <div className="hidden group-hover:flex bg-overlay-background h-full flex-col justify-center items-center">
          <HoverIcon icon={mdiEyeArrowRightOutline} label="View Series" route={`/webui/collection/series/${item.IDs.ID}`} />
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
    <React.Fragment>
      <Link className="text-panel-primary" to="/webui/collection">Entire Collection</Link>
      <span className="px-2">&gt;</span>
      {group?.Name}
      <span className="px-2">|</span>
      <span className="text-panel-important">{count} Items</span>
    </React.Fragment>
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
