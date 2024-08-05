import React, { useMemo } from 'react';
import { mdiCloseCircleOutline, mdiOpenInNew, mdiPencilCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import { useDeleteSeriesTmdbLinkMutation, useDeleteSeriesTvdbLinkMutation } from '@/core/react-query/series/mutations';
import useEventCallback from '@/hooks/useEventCallback';

type Props = {
  id?: number;
  seriesId: number;
  site: 'AniDB' | 'TMDB' | 'TvDB' | 'TraktTv';
  type?: 'Movie' | 'Show';
};

const MetadataLink = ({ id, seriesId, site, type }: Props) => {
  const { mutate: deleteTmdbLink } = useDeleteSeriesTmdbLinkMutation(type ?? 'Movie');
  const { mutate: deleteTvdbLink } = useDeleteSeriesTvdbLinkMutation();

  const siteLink = useMemo(() => {
    if (!id) return '#';
    switch (site) {
      case 'AniDB':
        return `https://anidb.net/anime/${id}`;
      case 'TMDB':
        return `https://www.themoviedb.org/${type === 'Show' ? 'tv' : 'movie'}/${id}`;
      case 'TvDB':
        return `https://thetvdb.com/?tab=series&id=${id}`;
      case 'TraktTv':
        // TODO: Figure how to get trakt series link using ID
        return '#';
      default:
        return '#';
    }
  }, [id, site, type]);

  const canRemoveLink = useMemo(() => site === 'TvDB' || site === 'TMDB', [site]);

  const removeLink = useEventCallback(() => {
    if (!id) return;
    switch (site) {
      case 'TvDB':
        deleteTvdbLink(seriesId);
        break;
      case 'TMDB':
        deleteTmdbLink(seriesId);
        break;
      default:
        break;
    }
  });

  return (
    <div key={site} className="flex justify-between">
      <div className="flex gap-x-4">
        <div className={`metadata-link-icon ${site}`} />
        {id
          ? (
            <a
              href={siteLink}
              className="flex gap-x-2 font-semibold text-panel-text-primary"
              rel="noopener noreferrer"
              target="_blank"
            >
              {`${site} (${type ? type[0].toLowerCase() : ''}${id})`}
              <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
            </a>
          )
          : 'Series Not Linked'}
      </div>
      {site !== 'AniDB' && (
        <div className="flex gap-x-2">
          {id
            ? (
              <>
                <Button disabled>
                  <Icon className="text-panel-icon-action" path={mdiPencilCircleOutline} size={1} />
                </Button>
                <Button disabled={!canRemoveLink} onClick={removeLink} tooltip="Remove link">
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
