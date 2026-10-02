import { Link } from 'react-router';
import { mdiCloseCircleOutline, mdiOpenInNew, mdiPencilCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import MetadataSourceIcon from '@/components/Collection/MetadataSourceIcon';
import Button from '@/components/Input/Button';
import { isAnidbSource } from '@/core/react-query/metadata/helpers';
import { useSeriesMetadataDeleteLinkMutation } from '@/core/react-query/metadata/mutations';
import { invalidateQueries, resetQueries } from '@/core/react-query/queryClient';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { MetadataLinkType } from '@/core/react-query/metadata/types';

type Props = {
  /** Whether the server has an icon for the source. */
  hasIcon?: boolean;
  seriesId: number;
  /** `AniDB`, or the source as the metadata routes take it. */
  source: string;
  id?: number | string;
  /** Shows the entry without a link to the linking page or any action. */
  readOnly?: boolean;
  /** The source's display name, when it differs from `source`. */
  sourceName?: string;
  /** The entry's page on its source's site; without one, the entry opens on the linking page. */
  siteUrl?: string | null;
  type?: MetadataLinkType;
};

const SeriesMetadataLink = ({
  hasIcon,
  id,
  readOnly = false,
  seriesId,
  siteUrl,
  source,
  sourceName = source,
  type,
}: Props) => {
  const navigate = useNavigateVoid();
  const { mutate: deleteLink } = useSeriesMetadataDeleteLinkMutation(seriesId, source, type ?? 'Movie');

  const isAnidb = isAnidbSource(source);
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
      onSuccess: () => {
        invalidateQueries(['series', seriesId]);
        // The cross-references query is disabled once no link is left, so invalidating would keep its old data.
        resetQueries(['series', seriesId, 'metadata', source, 'cross-references']);
      },
    });
  };

  const label = `${sourceName} (${type ? type[0].toLowerCase() : ''}${id})`;

  return (
    <div className="w-full rounded-lg border border-panel-border bg-panel-background px-4 py-3">
      <div className="flex justify-between">
        <div className="flex gap-x-4">
          {isAnidb
            ? <div className="metadata-link-icon AniDB" />
            : <MetadataSourceIcon hasIcon={hasIcon} source={source} />}
          {id && siteUrl && (
            <a
              href={siteUrl}
              className="flex gap-x-2 font-semibold text-panel-text-primary"
              rel="noopener noreferrer"
              target="_blank"
            >
              {label}
              <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
            </a>
          )}
          {id && !siteUrl && readOnly && <span className="font-semibold text-panel-text-primary">{label}</span>}
          {id && !siteUrl && !readOnly && (
            <Link to={editLinkingPage} className="flex gap-x-2 font-semibold text-panel-text-primary">
              {label}
            </Link>
          )}
          {!id && (isAnidb ? 'Series Not Linked' : `Add ${sourceName} Link`)}
        </div>
        {!isAnidb && !readOnly && (
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
