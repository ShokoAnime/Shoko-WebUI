import React, { useMemo } from 'react';
import { mdiCloseCircleOutline, mdiOpenInNew, mdiPencilCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';

const MetadataLink = ({ id, site }: { site: string, id: number | number[] }) => {
  const linkId = Array.isArray(id) ? id[0] : id;

  const siteLink = useMemo(() => {
    switch (site) {
      case 'AniDB':
        return `https://anidb.net/anime/${linkId}`;
      case 'TMDB':
        return `https://www.themoviedb.org/movie/${linkId}`;
      case 'TvDB':
        // TODO: Figure how to get trakt series link using ID
        return '#';
      case 'TraktTv':
        // TODO: Figure how to get trakt series link using ID
        return '#';
      default:
        return '#';
    }
  }, [linkId, site]);

  return (
    <div key={site} className="flex justify-between">
      <div className="flex gap-x-4">
        <div className={`metadata-link-icon ${site}`} />
        {linkId
          ? (
            <a
              href={siteLink}
              className="flex gap-x-2 font-semibold text-panel-text-primary"
              rel="noopener noreferrer"
              target="_blank"
            >
              {site}
              <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
            </a>
          )
          : 'Series Not Linked'}
      </div>
      {site !== 'AniDB' && (
        <div className="flex gap-x-2">
          {linkId
            ? (
              <>
                <Button disabled>
                  <Icon className="text-panel-icon-action" path={mdiPencilCircleOutline} size={1} />
                </Button>
                <Button disabled>
                  <Icon className="text-panel-icon-danger" path={mdiCloseCircleOutline} size={1} />
                </Button>
              </>
            )
            : (
              <Button disabled>
                <Icon className="text-panel-icon-action" path={mdiPlusCircleOutline} size={1} />
              </Button>
            )}
        </div>
      )}
    </div>
  );
};

export default MetadataLink;
