import React from 'react';
import { Link } from 'react-router';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';

import type { ImageType } from '@/core/types/api/common';

type Props = {
  episodeId: number;
  shokoId: number;
  thumbnail?: ImageType;
  title: string;
  subtitle: string;
};

const DashboardEpisode = ({ episodeId, shokoId, thumbnail, title, subtitle }: Props) => (
  <Link
    className="group w-[28.75rem] flex flex-col shrink-0 justify-center"
    to={`/webui/collection/series/${shokoId}`}
  >
    <div
      key={`episode-${episodeId}`}
      className="flex w-full shrink-0 flex-col"
    >
      <BackgroundImagePlaceholderDiv
        image={thumbnail}
        className="h-[16.25rem] rounded-lg border border-panel-border drop-shadow-md"
        hidePlaceholderOnHover
        overlayOnHover
        zoomOnHover
      />

      <div
        className="mt-4 truncate text-center font-semibold"
        data-tooltip-id="tooltip"
        data-tooltip-content={title}
        data-tooltip-delay-show={500}
      >
        {title}
      </div>

      {subtitle && (
        <div
          className="truncate text-center font-semibold opacity-65"
          data-tooltip-id="tooltip"
          data-tooltip-content={subtitle}
          data-tooltip-delay-show={500}
        >
          {subtitle}
        </div>
      )}
    </div>
  </Link>
);

export default React.memo(DashboardEpisode);
