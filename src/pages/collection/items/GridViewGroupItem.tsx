import React from 'react';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { Icon } from '@mdi/react';
import { mdiEyeArrowRightOutline, mdiSquareEditOutline } from '@mdi/js';

import type { CollectionGroupType } from '../../../core/types/api/collection';
import BackgroundImagePlaceholderDiv from '../../../components/BackgroundImagePlaceholderDiv';

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

const CountIcon = ({ className, children, show = true }) => (
  show ? <div className={cx('m-3 px-3 py-1 bg-highlight-2 rounded font-semibold text-white text-center min-w-[1.75rem] bg-opacity-85 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]', className)}>{children}</div> : null
);

const GridViewGroupItem = (item: CollectionGroupType) => {
  const posters = item.Images.Posters;
  const unwatchedCount = item.Sizes.Local.Episodes + item.Sizes.Local.Specials - item.Sizes.Watched.Episodes - item.Sizes.Watched.Specials;
  const groupCount = item.Sizes.SeriesTypes.Movie + item.Sizes.SeriesTypes.OVA + item.Sizes.SeriesTypes.Other + item.Sizes.SeriesTypes.TV + item.Sizes.SeriesTypes.TVSpecial + item.Sizes.SeriesTypes.Unknown + item.Sizes.SeriesTypes.Web;

  return (
    <div key={`group-${item.IDs.ID}`} className="group mx-2 shrink-0 w-[13.0625rem] content-center flex flex-col">
      <BackgroundImagePlaceholderDiv imageSrc={`/api/v3/Image/${posters[0].Source}/Poster/${posters[0].ID}`} className="h-[19.0625rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black mb-3 relative" hidePlaceholderOnHover={true}>
        <div className="absolute right-0 top-0 group-hover:hidden">
          <CountIcon show={unwatchedCount > 0} className="bg-highlight-2">{unwatchedCount}</CountIcon>
          <CountIcon show={groupCount > 1} className="bg-highlight-5">{item.Size}</CountIcon>
        </div>
        <div className="hidden group-hover:flex bg-background-nav/85 h-full flex-col justify-center items-center">
          <HoverIcon icon={mdiEyeArrowRightOutline} label="View Group" route={`/webui/collection/group/${item.IDs.ID}`} />
          <HoverIcon icon={mdiSquareEditOutline} label="Edit Group" route="" />
        </div>
      </BackgroundImagePlaceholderDiv>
      <p className="text-center text-sm font-semibold text-ellipsis line-clamp-1" title={item.Name}>{item.Name}</p>
    </div>
  );
};

export default GridViewGroupItem;