import { Link } from 'react-router';
import {
  mdiCloseCircleOutline,
  mdiDatabaseOutline,
  mdiOpenInNew,
  mdiPencilCircleOutline,
  mdiPlusCircleOutline,
} from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import { isAnidbSource, isTmdbSource } from '@/core/react-query/metadata/helpers';
import { useSeriesMetadataDeleteLinkMutation } from '@/core/react-query/metadata/mutations';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { getAnidbAnimeLink } from '@/core/util';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { MetadataLinkType } from '@/core/react-query/metadata/types';

type Props = {
  seriesId: number;
  /** `AniDB`, or the source as the metadata routes take it. */
  source: string;
  id?: number | string;
  /** The source's display name, when it differs from `source`. */
  sourceName?: string;
  type?: MetadataLinkType;
};

/**
 * The entry's page on its own site, where one is known. Only AniDB and TMDB
 * have one for now; the server does not send a site URL for other sources.
 */
const getSiteLink = (source: string, id: number | string, type?: MetadataLinkType) => {
  if (isAnidbSource(source)) return getAnidbAnimeLink(id);
  if (isTmdbSource(source)) return `https://www.themoviedb.org/${type === 'Show' ? 'tv' : 'movie'}/${id}`;
  return undefined;
};

const SeriesMetadataLink = ({ id, seriesId, source, sourceName = source, type }: Props) => {
  const navigate = useNavigateVoid();
  const { mutate: deleteLink } = useSeriesMetadataDeleteLinkMutation(seriesId, source, type ?? 'Movie');

  const isAnidb = isAnidbSource(source);
  const siteLink = id ? getSiteLink(source, id, type) : undefined;
  const linkingPage = `../metadata-linking?${new URLSearchParams({ source }).toString()}`;
  const editLinkingPage = id && type
    ? `../metadata-linking?${new URLSearchParams({ source, type, id: id.toString() }).toString()}`
    : linkingPage;

  const addLink = () => navigate(linkingPage);

  const editLink = () => {
    if (!id || !type) return;
    navigate(editLinkingPage);
  };

  const removeLink = () => {
    if (!id || !type) return;
    deleteLink({ ID: id.toString() }, {
      onSuccess: () => invalidateQueries(['series', seriesId]),
    });
  };

  const label = `${sourceName} (${type ? type[0].toLowerCase() : ''}${id})`;

  return (
    <div className="w-full rounded-lg border border-panel-border bg-panel-background px-4 py-3">
      <div className="flex justify-between">
        <div className="flex gap-x-4">
          {isAnidb || isTmdbSource(source)
            ? <div className={`metadata-link-icon ${source}`} />
            : <Icon className="shrink-0 text-panel-icon" path={mdiDatabaseOutline} size={1} />}
          {id && siteLink && (
            <a
              href={siteLink}
              className="flex gap-x-2 font-semibold text-panel-text-primary"
              rel="noopener noreferrer"
              target="_blank"
            >
              {label}
              <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
            </a>
          )}
          {id && !siteLink && (
            <Link to={editLinkingPage} className="flex gap-x-2 font-semibold text-panel-text-primary">
              {label}
            </Link>
          )}
          {!id && (isAnidb ? 'Series Not Linked' : `Add ${sourceName} Link`)}
        </div>
        {!isAnidb && (
          <div className="flex gap-x-2">
            {id
              ? type && (
                <>
                  <Button onClick={editLink} tooltip="Edit Link">
                    <Icon className="text-panel-icon-action" path={mdiPencilCircleOutline} size={1} />
                  </Button>
                  <Button onClick={removeLink} tooltip="Remove Link">
                    <Icon className="text-panel-icon-danger" path={mdiCloseCircleOutline} size={1} />
                  </Button>
                </>
              )
              : (
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

export default SeriesMetadataLink;
