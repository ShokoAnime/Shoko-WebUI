import { Link } from 'react-router';
import { mdiCloseCircleOutline, mdiOpenInNew, mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import MetadataSourceIcon from '@/components/Collection/MetadataSourceIcon';
import Button from '@/components/Input/Button';
import { useSeriesMetadataDeleteLinkMutation } from '@/core/react-query/metadata/mutations';
import { invalidateQueries } from '@/core/react-query/queryClient';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { MetadataLinkType } from '@/core/react-query/metadata/types';

type Props = {
  /** Whether the server has an icon for the source. */
  hasIcon?: boolean;
  seriesId: number;
  /** `AniDB`, or the source as the metadata routes take it. */
  site: string;
  id: number | string;
  /** The source's display name, when it differs from `site`. */
  siteName?: string;
  /** The entry's page on its source's site; without one, the entry opens on the linking page. */
  siteUrl?: string | null;
  type?: MetadataLinkType;
};

const SeriesMetadata = ({ hasIcon, id, seriesId, site, siteName = site, siteUrl, type }: Props) => {
  const navigate = useNavigateVoid();
  const { mutate: deleteLink } = useSeriesMetadataDeleteLinkMutation(seriesId, site, type ?? 'Movie');

  const isAnidb = site === 'AniDB';
  const editLinkingPage = `../metadata-linking?${
    new URLSearchParams(type ? { source: site, type, id: id.toString() } : { source: site }).toString()
  }`;

  const editLink = () => {
    if (!type) return;
    navigate(editLinkingPage);
  };

  const removeLink = () => {
    if (!type) return;
    deleteLink({ ID: id.toString() }, {
      onSuccess: () => invalidateQueries(['series', seriesId]),
    });
  };

  const label = `${siteName} (${type ? type[0].toLowerCase() : ''}${id})`;

  return (
    <div className="w-full rounded-lg border border-panel-border bg-panel-background px-4 py-3">
      <div className="flex justify-between">
        <div className="flex gap-x-4">
          {isAnidb
            ? <div className="metadata-link-icon AniDB" />
            : <MetadataSourceIcon hasIcon={hasIcon} source={site} />}
          {siteUrl
            ? (
              <a
                href={siteUrl}
                className="flex gap-x-2 font-semibold text-panel-text-primary"
                rel="noopener noreferrer"
                target="_blank"
              >
                {label}
                <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
              </a>
            )
            : (
              <Link to={editLinkingPage} className="flex gap-x-2 font-semibold text-panel-text-primary">
                {label}
              </Link>
            )}
        </div>
        {!isAnidb && type && (
          <div className="flex gap-x-2">
            <Button onClick={editLink} tooltip="Edit Link">
              <Icon className="text-panel-icon-action" path={mdiPencilCircleOutline} size={1} />
            </Button>
            <Button onClick={removeLink} tooltip="Remove Link">
              <Icon className="text-panel-icon-danger" path={mdiCloseCircleOutline} size={1} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesMetadata;
