import React, { useMemo } from 'react';
import { Link } from 'react-router';
import cx from 'classnames';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';

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

const SeriesPoster = React.memo((props: Props) => {
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
            View on AniDB
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

  if (shokoId) {
    return (
      <Link className={cx(baseClassName, 'group')} to={`/webui/collection/series/${shokoId}`}>
        {content}
      </Link>
    );
  }

  if (anidbSeriesId ?? anidbEpisodeId) {
    return (
      <a
        href={`https://anidb.net/${anidbSeriesId ? `anime/${anidbSeriesId}` : `episode/${anidbEpisodeId}`}`}
        className={cx(baseClassName, 'group')}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return <div className={baseClassName}>{content}</div>;
});

export default SeriesPoster;
