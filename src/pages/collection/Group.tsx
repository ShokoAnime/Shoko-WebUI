import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';

import { Link } from 'react-router-dom';

import { useGetGroupSeriesQuery } from '../../core/rtkQuery/splitV3Api/collectionApi';
import ShokoPanel from '../../components/Panels/ShokoPanel';

import { RootState } from '../../core/store';
import type { SeriesType } from '../../core/types/api/series';
import { CollectionGroupType } from '../../core/types/api/collection';
import BackgroundImagePlaceholderDiv from '../../components/BackgroundImagePlaceholderDiv';
import { mdiEyeArrowRightOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

const HoverIcon = ({ icon, label, route }) => (
  <Link to={route}>
    <div className="flex flex-col justify-items-center items-center my-2">
      <div className="bg-background-border rounded-full inline-block shrink p-4 text-highlight-1 mb-2">
        <Icon path={icon} size={1} />
      </div>
      <span className="font-semibold">{label}</span>
    </div>
  </Link>
);

const Group = () => {
  const { groupId } = useParams();

  const groups: Array<CollectionGroupType> = useSelector((state: RootState) => state.collection.groups);
  const series = useGetGroupSeriesQuery({ groupId });
  const items: Array<SeriesType> = series?.data ?? [] as Array<SeriesType>;

  const group = useMemo(() => groups.filter((item:CollectionGroupType) => `${item.IDs.ID}` === groupId)[0], [groupId, groups]);

  const renderDetails = (item: SeriesType) => (
    <div key={`series-${item.IDs.ID}`} className="group mr-4 last:mr-0 shrink-0 w-56 content-center flex flex-col">
      <BackgroundImagePlaceholderDiv imageSrc={`/api/v3/Image/${item.Images.Posters[0].Source}/Poster/${item.Images.Posters[0].ID}`} className="h-72 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2">
        <div className="hidden group-hover:flex bg-background-nav/85 h-full flex-col justify-center items-center">
          <HoverIcon icon={mdiEyeArrowRightOutline} label="View Series" route={`/webui/collection/series/${item.IDs.ID}`} />
        </div>
      </BackgroundImagePlaceholderDiv>
      <p className="text-center text-base font-semibold" title={item.Name}>{item.Name}</p>
    </div>
  );

  const renderTitle = count => (
    <React.Fragment>
      <Link className="text-highlight-1" to="/webui/collection">Entire Collection</Link>
      <span className="px-2">&gt;</span>
      {group?.Name}
      <span className="px-2">|</span>
      <span className="text-highlight-2">{count} Items</span>
    </React.Fragment>
  );

  return (
    <div className="p-9 pr-0 h-full min-w-full">
      <ShokoPanel title={renderTitle(items.length)}>
      <div className="flex flex-wrap space-x-2">
        {items.map(item => renderDetails(item))}
      </div>
      </ShokoPanel>
    </div>
  );
};

export default React.memo(Group);
