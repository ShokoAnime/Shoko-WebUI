import React, { useMemo } from 'react';
import { mdiCloseCircleOutline, mdiOpenInNew, mdiPencilCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import { useDeleteSeriesTvdbLinkMutation } from '@/core/react-query/series/mutations';
import useEventCallback from '@/hooks/useEventCallback';

const MetadataLink = (
  { id, seriesId, site, type }: {
    id?: number | number[] | null;
    seriesId: number;
    site: 'AniDB' | 'TMDB' | 'TvDB' | 'TraktTv';
    type?: 'Movie' | 'Show';
  },
) => {
  const linkId = Array.isArray(id) ? id[0] || null : id ?? null;

  const { mutate: deleteTvdbLink } = useDeleteSeriesTvdbLinkMutation();

  const siteLink = useMemo(() => {
    if (!linkId) return '#';
    switch (site) {
      case 'AniDB':
        return `https://anidb.net/anime/${linkId}`;
      case 'TMDB':
        switch (type) {
          case 'Show':
            return `https://www.themoviedb.org/tv/${linkId}`;
          default:
            return `https://www.themoviedb.org/movie/${linkId}`;
        }
      case 'TvDB':
        return `https://thetvdb.com/?tab=series&id=${linkId}`;
      case 'TraktTv':
        // TODO: Figure how to get trakt series link using ID
        return '#';
      default:
        return '#';
    }
  }, [linkId, site, type]);

  const canDisable = site === 'TvDB' || site === 'TMDB';

  const disableMetadata = useEventCallback(() => {
    if (!linkId) return;
    switch (site) {
      case 'TvDB':
        deleteTvdbLink(seriesId);
        break;
      case 'TMDB':
        switch (type) {
          case 'Show':
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  });

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
              {`${site} (${type ? type[0].toLowerCase() : ''}${linkId})`}
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
                <Button disabled={!canDisable} onClick={disableMetadata} tooltip="Remove link">
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
