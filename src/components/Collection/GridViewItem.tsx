import React from 'react';
import { Link } from 'react-router-dom';
import { mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import CountIcon from '@/components/Collection/CountIcon';
import useMainPoster from '@/hooks/useMainPoster';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

type Props = {
  item: CollectionGroupType | SeriesType;
  isSeries?: boolean;
};

const GridViewItem = ({ isSeries = false, item }: Props) => {
  const mainPoster = useMainPoster(item);
  const unwatchedCount = item.Sizes.Local.Episodes + item.Sizes.Local.Specials - item.Sizes.Watched.Episodes
    - item.Sizes.Watched.Specials;
  let groupCount = 0;

  if (!isSeries) {
    const groupItem = item as CollectionGroupType;
    groupCount = groupItem.Sizes.SeriesTypes.Movie + groupItem.Sizes.SeriesTypes.OVA + groupItem.Sizes.SeriesTypes.Other
      + groupItem.Sizes.SeriesTypes.TV + groupItem.Sizes.SeriesTypes.TVSpecial + groupItem.Sizes.SeriesTypes.Unknown
      + groupItem.Sizes.SeriesTypes.Web;
  }

  const viewRouteLink = () => {
    let link = '/webui/collection/';

    if (isSeries) {
      link += `series/${item.IDs.ID}`;
    } else if (item.Size === 1) {
      link += `series/${(item as CollectionGroupType).IDs.MainSeries}`;
    } else {
      link += `group/${item.IDs.ID}`;
    }

    return link;
  };

  return (
    <Link to={viewRouteLink()}>
      <div className="group flex w-[13.0625rem] shrink-0 flex-col content-center">
        <BackgroundImagePlaceholderDiv
          image={mainPoster}
          className="mb-3 h-[19.0625rem] rounded-md border border-overlay-border drop-shadow-md"
          hidePlaceholderOnHover
          zoomOnHover
        >
          <div className="absolute right-3 top-3 z-20 flex flex-col gap-y-3">
            <CountIcon show={unwatchedCount > 0} className="bg-overlay-count-episode">{unwatchedCount}</CountIcon>
            {!isSeries && <CountIcon show={groupCount > 1} className="bg-overlay-count-group">{item.Size}</CountIcon>}
          </div>
          <div className="pointer-events-none z-10 flex h-full bg-overlay-background p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
            <Link to="#" className="h-fit">
              <Icon
                path={mdiPencilCircleOutline}
                size="2rem"
                className="text-overlay-icon hover:text-overlay-icon-hover"
              />
            </Link>
          </div>
        </BackgroundImagePlaceholderDiv>
        <p className="line-clamp-1 text-ellipsis text-center text-sm font-semibold" title={item.Name}>{item.Name}</p>
      </div>
    </Link>
  );
};

export default GridViewItem;
