import React from 'react';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { Icon } from '@mdi/react';
import { mdiPencilCircleOutline } from '@mdi/js';

import type { CollectionGroupType } from '@/core/types/api/collection';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';

const CountIcon = ({ className, children, show = true }) => (
  show ? <div className={cx('px-3 py-1 rounded font-semibold text-panel-text text-center min-w-[1.75rem] bg-opacity-85 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]', className)}>{children}</div> : null
);

const GridViewItem = (item: CollectionGroupType) => {
  const posters = item.Images.Posters;
  const unwatchedCount = item.Sizes.Local.Episodes + item.Sizes.Local.Specials - item.Sizes.Watched.Episodes - item.Sizes.Watched.Specials;
  const groupCount = item.Sizes.SeriesTypes.Movie + item.Sizes.SeriesTypes.OVA + item.Sizes.SeriesTypes.Other + item.Sizes.SeriesTypes.TV + item.Sizes.SeriesTypes.TVSpecial + item.Sizes.SeriesTypes.Unknown + item.Sizes.SeriesTypes.Web;

  const viewRouteLink = () => {
    let link = '/webui/collection/';

    if (item.Size === 1) {
      link += `series/${item.IDs.MainSeries}`;
    } else {
      link += `group/${item.IDs.ID}`;
    }

    return link;
  };

  return (
    <Link to={viewRouteLink()} key={`group-${item.IDs.ID}`}>
      <div className="group shrink-0 w-[13.0625rem] content-center flex flex-col">
        <BackgroundImagePlaceholderDiv imageSrc={`/api/v3/Image/${posters[0].Source}/Poster/${posters[0].ID}`} className="h-[19.0625rem] rounded-md drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-overlay-border mb-3 relative" hidePlaceholderOnHover zoomOnHover>
          <div className="absolute right-3 top-3 z-20 flex flex-col gap-y-3">
            <CountIcon show={unwatchedCount > 0} className="bg-overlay-count-episode">{unwatchedCount}</CountIcon>
            <CountIcon show={groupCount > 1} className="bg-overlay-count-group">{item.Size}</CountIcon>
          </div>
          <div className="pointer-events-none opacity-0 flex bg-overlay-background h-full p-3 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
            <Link to="#" className="h-fit">
              <Icon path={mdiPencilCircleOutline} size="2rem" className="text-overlay-icon hover:text-overlay-icon-hover" />
            </Link>
          </div>
        </BackgroundImagePlaceholderDiv>
        <p className="text-center text-sm font-semibold text-ellipsis line-clamp-1" title={item.Name}>{item.Name}</p>
      </div>
    </Link>
  );
};

export default GridViewItem;
