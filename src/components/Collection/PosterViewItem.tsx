import React from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { mdiCheckboxMarkedCircleOutline, mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { reduce } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import Button from '@/components/Input/Button';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { setGroupId } from '@/core/slices/modals/editGroup';
import { setSeriesId } from '@/core/slices/modals/editSeries';
import useEventCallback from '@/hooks/useEventCallback';
import useMainPoster from '@/hooks/useMainPoster';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

type Props = {
  item: CollectionGroupType | SeriesType;
  isSeries?: boolean;
};

const PosterViewItem = ({ isSeries = false, item }: Props) => {
  const settings = useSettingsQuery().data;
  const { showEpisodeCount, showGroupIndicator, showUnwatchedCount } = settings.WebUI_Settings.collection.poster;

  const mainPoster = useMainPoster(item);
  const episodeCount = item.Sizes.Local.Episodes + item.Sizes.Local.Specials + item.Sizes.Local.Others;
  const unwatchedCount = Math.max(
    episodeCount - item.Sizes.Watched.Episodes - item.Sizes.Watched.Specials - item.Sizes.Watched.Others,
    0,
  );
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

  const dispatch = useDispatch();

  const editSeriesModalCallback = useEventCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    dispatch(setSeriesId(('MainSeries' in item.IDs) ? item.IDs.MainSeries : item.IDs.ID));
  });

  const editGroupModalCallback = useEventCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    dispatch(setGroupId(item.IDs.ParentGroup ?? item.IDs.TopLevelGroup));
  });

  return (
    <div
      className="flex shrink-0 flex-col content-center gap-y-3"
      style={{ width: '12.938rem' }}
    >
      <Link to={viewRouteLink()}>
        <BackgroundImagePlaceholderDiv
          image={mainPoster}
          className="group h-[19rem] rounded-lg border border-panel-border drop-shadow-md"
          hidePlaceholderOnHover
          zoomOnHover
        >
          {showUnwatchedCount && (
            <div className="absolute right-0 top-0 flex min-w-[2.81rem] justify-center rounded-bl-md bg-panel-background-overlay p-3 font-semibold opacity-100 transition-opacity group-hover:opacity-0">
              {unwatchedCount || (
                <Icon path={mdiCheckboxMarkedCircleOutline} size={1} className="text-panel-icon-important" />
              )}
            </div>
          )}
          <div className="pointer-events-none z-10 flex h-full bg-panel-background-poster-overlay p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
            <Button
              className="pointer-events-auto h-fit"
              onClick={(isSeries || item.Size === 1) ? editSeriesModalCallback : editGroupModalCallback}
              tooltip="Edit Series"
            >
              <Icon path={mdiPencilCircleOutline} size="2rem" />
            </Button>
          </div>
          {showGroupIndicator && !isSeries && groupCount > 1 && (
            <div className="absolute bottom-4 left-3 flex w-[90%] justify-center rounded-lg bg-panel-background-overlay py-2 text-sm font-semibold text-panel-text opacity-100 transition-opacity group-hover:opacity-0">
              {groupCount}
              &nbsp;Series
            </div>
          )}
        </BackgroundImagePlaceholderDiv>
      </Link>
      <div>
        <p className="line-clamp-1 text-ellipsis text-center text-sm font-semibold">
          <Link
            to={viewRouteLink()}
            className="transition-colors hover:text-panel-text-primary"
            data-tooltip-id="tooltip"
            data-tooltip-content={item.Name}
          >
            {item.Name}
          </Link>
        </p>
        {showEpisodeCount && (
          <p
            className="line-clamp-1 text-ellipsis text-center text-sm font-semibold opacity-65"
            title={`${episodeCount.toString()} Episodes`}
          >
            {episodeCount}
            &nbsp;Episodes
          </p>
        )}
      </div>
    </div>
  );
};

export default PosterViewItem;
