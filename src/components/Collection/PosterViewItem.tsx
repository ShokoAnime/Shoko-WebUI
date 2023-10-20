import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mdiCheckboxMarkedCircleOutline, mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { reduce } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { posterItemSize } from '@/components/Collection/CollectionView';
import { useGetSettingsQuery } from '@/core/rtkQuery/splitV3Api/settingsApi';
import useMainPoster from '@/hooks/useMainPoster';
import { initialSettings } from '@/pages/settings/SettingsPage';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

type Props = {
  item: CollectionGroupType | SeriesType;
  isSeries?: boolean;
};

const PosterViewItem = ({ isSeries = false, item }: Props) => {
  const settingsQuery = useGetSettingsQuery(undefined, { refetchOnMountOrArgChange: false });
  const settings = useMemo(() => settingsQuery?.data ?? initialSettings, [settingsQuery]);
  const { showEpisodeCount, showGroupIndicator, showUnwatchedCount } = settings.WebUI_Settings.collection.poster;

  const mainPoster = useMainPoster(item);
  const episodeCount = item.Sizes.Local.Episodes + item.Sizes.Local.Specials;
  const unwatchedCount = episodeCount - item.Sizes.Watched.Episodes - item.Sizes.Watched.Specials;
  let groupCount = 0;

  if (!isSeries) {
    groupCount = reduce((item as CollectionGroupType).Sizes.SeriesTypes, (count, value) => count + value, 0);
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
      <div className="group flex shrink-0 flex-col content-center" style={{ width: `${posterItemSize.width / 16}rem` }}>
        <BackgroundImagePlaceholderDiv
          image={mainPoster}
          className="mb-3 h-[19.0625rem] rounded-md border border-panel-border drop-shadow-md"
          hidePlaceholderOnHover
          zoomOnHover
        >
          {showUnwatchedCount && (
            <div className="absolute right-0 top-0 flex min-w-[2.5rem] justify-center rounded-bl-md bg-panel-background-overlay p-2 font-semibold opacity-100 transition-opacity group-hover:opacity-0">
              {unwatchedCount || (
                <Icon path={mdiCheckboxMarkedCircleOutline} size={1} className="text-panel-important" />
              )}
            </div>
          )}
          <div className="pointer-events-none z-50 flex h-full bg-overlay-background p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
            <Link to="#" className="h-fit">
              <Icon
                path={mdiPencilCircleOutline}
                size="2rem"
                className="text-overlay-icon hover:text-overlay-icon-hover"
              />
            </Link>
          </div>
          {showGroupIndicator && !isSeries && groupCount > 1 && (
            <div className="absolute bottom-0 left-0 flex w-full justify-center rounded-bl-md bg-panel-background-overlay py-1.5 text-sm font-semibold text-panel-text-transparent opacity-100 transition-opacity group-hover:opacity-0">
              {groupCount}
              &nbsp;Series
            </div>
          )}
        </BackgroundImagePlaceholderDiv>
        <p className="line-clamp-1 text-ellipsis text-center text-sm font-semibold" title={item.Name}>{item.Name}</p>
        {showEpisodeCount && (
          <p
            className="mt-1.5 line-clamp-1 text-ellipsis text-center text-sm font-semibold text-panel-text-transparent"
            title={episodeCount.toString()}
          >
            {episodeCount}
            &nbsp;Episodes
          </p>
        )}
      </div>
    </Link>
  );
};

export default PosterViewItem;
