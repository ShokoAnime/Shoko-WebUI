import React, { useMemo } from 'react';
import { mdiCloseCircleOutline, mdiOpenInNew, mdiPencilCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { useDeleteTmdbLinkMutation } from '@/core/react-query/tmdb/mutations';
import useEventCallback from '@/hooks/useEventCallback';
import useNavigateVoid from '@/hooks/useNavigateVoid';

type Props = {
  id?: number;
  seriesId: number;
  site: 'AniDB' | 'TMDB' | 'TraktTv';
  type?: 'Movie' | 'Show';
};

const MetadataLink = ({ id, seriesId, site, type }: Props) => {
  const navigate = useNavigateVoid();
  const { mutate: deleteTmdbLink } = useDeleteTmdbLinkMutation(seriesId, type ?? 'Movie');

  const siteLink = useMemo(() => {
    if (!id) return '#';
    switch (site) {
      case 'AniDB':
        return `https://anidb.net/anime/${id}`;
      case 'TMDB':
        return `https://www.themoviedb.org/${type === 'Show' ? 'tv' : 'movie'}/${id}`;
      case 'TraktTv':
        return `https://trakt.tv/shows/${id}`;
      default:
        return '#';
    }
  }, [id, site, type]);

  const canAddLink = useMemo(() => site === 'TMDB', [site]);
  const canEditLink = useMemo(() => site === 'TMDB', [site]);
  const canRemoveLink = useMemo(() => site === 'TMDB', [site]);

  const addLink = useEventCallback(() => {
    navigate('../tmdb-linking');
  });

  const editLink = useEventCallback(() => {
    if (!id || !type) return;
    navigate(`../tmdb-linking?type=${type}&id=${id}`);
  });

  const removeLink = useEventCallback(() => {
    if (!id) return;
    switch (site) {
      case 'TMDB':
        deleteTmdbLink({ ID: id }, {
          onSuccess: () => invalidateQueries(['series', seriesId]),
        });
        break;
      default:
        break;
    }
  });

  return (
    <div className="w-full rounded-lg border border-panel-border bg-panel-background px-4 py-3">
      <div className="flex justify-between">
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
            : (
              <>
                {site === 'TMDB' && 'Add TMDB Link'}
                {site !== 'TMDB' && 'Series Not Linked'}
              </>
            )}
        </div>
        {site !== 'AniDB' && (
          <div className="flex gap-x-2">
            {id
              ? (
                <>
                  {canEditLink && (
                    <Button onClick={editLink} tooltip="Edit Link">
                      <Icon className="text-panel-icon-action" path={mdiPencilCircleOutline} size={1} />
                    </Button>
                  )}
                  {canRemoveLink && (
                    <Button onClick={removeLink} tooltip="Remove Link">
                      <Icon className="text-panel-icon-danger" path={mdiCloseCircleOutline} size={1} />
                    </Button>
                  )}
                </>
              )
              : canAddLink && (
                <Button onClick={addLink} tooltip="Add Link">
                  <Icon className="text-panel-icon-action" path={mdiPlusCircleOutline} size={1} />
                </Button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetadataLink;
