import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { mdiDotsHorizontalCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import Button from '@/components/Input/Button';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { useRefreshAniDBSeriesMutation } from '@/core/react-query/series/mutations';
import toast from '@/core/toast';

import type { ImageType } from '@/core/types/api/common';

type Props = {
  children?: React.ReactNode;
  title: string;
  subtitle?: string;
  image?: ImageType;
  shokoId?: number | null;
  anidbSeriesId?: number;
  anidbEpisodeId?: number;
  inCollection?: boolean;
};

const baseClassName = 'w-56 flex flex-col shrink-0';

const SeriesPoster = (props: Props) => {
  const {
    anidbEpisodeId,
    anidbSeriesId,
    children,
    image,
    inCollection,
    shokoId,
    subtitle,
    title,
  } = props;

  const isAnidb = useMemo(() => {
    if (shokoId) return false;
    return anidbSeriesId !== undefined || anidbEpisodeId !== undefined;
  }, [anidbEpisodeId, anidbSeriesId, shokoId]);

  const {
    isPending: isRefreshPending,
    mutate: refreshSeries,
  } = useRefreshAniDBSeriesMutation();

  const createSeries = (anidbId: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    refreshSeries({ anidbID: anidbId, immediate: true, createSeriesEntry: true, force: true }, {
      onSuccess: () => {
        toast.success('Series added successfully!');
        invalidateQueries(['series']);
      },
      onError: (error) => {
        console.error(error);
        toast.error('Failed to add series! Unable to create series entry.');
      },
    });
  };

  const content = (
    <>
      <BackgroundImagePlaceholderDiv
        image={image}
        className="h-80 rounded-lg border border-panel-border drop-shadow-md"
        hidePlaceholderOnHover
        overlayOnHover
        zoomOnHover
        inCollection={inCollection}
      >
        {isAnidb && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-y-3 text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100">
            <div className="metadata-link-icon AniDB" />
            {isRefreshPending ? 'Fetching from AniDB' : 'View on AniDB'}
          </div>
        )}

        {isAnidb && anidbSeriesId && !isRefreshPending && (
          <div className="pointer-events-none absolute z-15 flex h-full p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
            <Button
              className="pointer-events-auto h-fit"
              onClick={event => createSeries(anidbSeriesId, event)}
              tooltip="Add to collection"
            >
              <Icon path={isRefreshPending ? mdiDotsHorizontalCircleOutline : mdiPlusCircleOutline} size={1} />
            </Button>
          </div>
        )}

        {children}

        {inCollection && (
          <div className="absolute bottom-4 left-3 flex w-[90%] justify-center rounded-lg bg-panel-background-overlay py-2 text-sm font-semibold text-panel-text opacity-100 transition-opacity group-hover:opacity-0">
            In Collection
          </div>
        )}
      </BackgroundImagePlaceholderDiv>

      <div
        className="mt-3 truncate text-center text-sm font-semibold"
        data-tooltip-id="tooltip"
        data-tooltip-content={title}
        data-tooltip-delay-show={500}
      >
        {title}
      </div>

      {subtitle && (
        <div
          className="truncate text-center text-sm font-semibold opacity-65"
          data-tooltip-id="tooltip"
          data-tooltip-content={subtitle}
          data-tooltip-delay-show={500}
        >
          {subtitle}
        </div>
      )}
    </>
  );

  if (!isRefreshPending && shokoId) {
    return (
      <Link className={cx(baseClassName, 'group')} to={`/webui/collection/series/${shokoId}`}>
        {content}
      </Link>
    );
  }

  if (anidbEpisodeId ?? anidbSeriesId) {
    return (
      <a
        href={`https://anidb.net/${anidbEpisodeId ? `episode/${anidbEpisodeId}` : `anime/${anidbSeriesId}`}`}
        className={cx(baseClassName, 'group')}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return <div className={baseClassName}>{content}</div>;
};

export default SeriesPoster;
