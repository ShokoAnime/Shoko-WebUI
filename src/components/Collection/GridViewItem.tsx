import React from 'react';
import { Link } from 'react-router-dom';
import { mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import useMainPoster from '@/hooks/useMainPoster';

import type { CollectionGroupType } from '@/core/types/api/collection';

const CountIcon = ({ children, className, show = true }) => (
  show
    ? (
      <div
        className={cx(
          'px-3 py-1 rounded font-semibold text-panel-text text-center min-w-[1.75rem] bg-opacity-85 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]',
          className,
        )}
      >
        {children}
      </div>
    )
    : null
);

const GridViewItem = ({ item }: { item: CollectionGroupType }) => {
  const mainPoster = useMainPoster(item);
  const unwatchedCount = item.Sizes.Local.Episodes + item.Sizes.Local.Specials - item.Sizes.Watched.Episodes
    - item.Sizes.Watched.Specials;
  const groupCount = item.Sizes.SeriesTypes.Movie + item.Sizes.SeriesTypes.OVA + item.Sizes.SeriesTypes.Other
    + item.Sizes.SeriesTypes.TV + item.Sizes.SeriesTypes.TVSpecial + item.Sizes.SeriesTypes.Unknown
    + item.Sizes.SeriesTypes.Web;

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
      <div className="group flex w-[13.0625rem] shrink-0 flex-col content-center">
        <BackgroundImagePlaceholderDiv
          image={mainPoster}
          className="relative mb-3 h-[19.0625rem] rounded-md border border-overlay-border drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
          hidePlaceholderOnHover
          zoomOnHover
        >
          <div className="absolute right-3 top-3 z-20 flex flex-col gap-y-3">
            <CountIcon show={unwatchedCount > 0} className="bg-overlay-count-episode">{unwatchedCount}</CountIcon>
            <CountIcon show={groupCount > 1} className="bg-overlay-count-group">{item.Size}</CountIcon>
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
