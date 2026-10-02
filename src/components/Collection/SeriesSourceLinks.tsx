import { uniqBy } from 'lodash';

import SeriesMetadataLink from '@/components/Collection/SeriesMetadataLink';
import { useSeriesMetadataCrossReferencesQuery } from '@/core/react-query/metadata/queries';

import type { MetadataLinkType } from '@/core/react-query/metadata/types';

type Props = {
  /** Whether the source can be linked to now, which adds a row to link it. */
  canLink: boolean;
  /** Whether the server has an icon for the source. */
  hasIcon: boolean;
  /** The IDs the series is linked to on the source, from the series' `IDs.Linked`. */
  linkedIds: string[];
  name: string;
  /** Whether the links can only be shown, for a source the linking page does not know. */
  readOnly: boolean;
  seriesId: number;
  source: string;
};

const isLinkType = (entityType: string): entityType is MetadataLinkType =>
  entityType === 'Show' || entityType === 'Movie';

/** A series' links to one source other than AniDB, and a row to add one. */
const SeriesSourceLinks = ({ canLink, hasIcon, linkedIds, name, readOnly, seriesId, source }: Props) => {
  // The series only lists the linked IDs, so the cross-references tell whether each is a series or a movie.
  const crossReferencesQuery = useSeriesMetadataCrossReferencesQuery(
    seriesId,
    source,
    linkedIds.length > 0 && !readOnly,
  );

  const links: { id: string, siteUrl?: string | null, type?: MetadataLinkType }[] = crossReferencesQuery.data
    ? uniqBy(
      crossReferencesQuery.data.flatMap(xref => (xref.ID && isLinkType(xref.EntityType)
        ? [{ id: xref.ID, siteUrl: xref.SiteUrl, type: xref.EntityType }]
        : [])
      ),
      link => `${link.type}-${link.id}`,
    )
    : linkedIds.map(id => ({ id }));

  return (
    <>
      {links.map(link => (
        <SeriesMetadataLink
          key={`${source}-${link.type}-${link.id}`}
          hasIcon={hasIcon}
          id={link.id}
          readOnly={readOnly}
          seriesId={seriesId}
          source={source}
          sourceName={name}
          siteUrl={link.siteUrl}
          type={link.type}
        />
      ))}
      {canLink && <SeriesMetadataLink hasIcon={hasIcon} seriesId={seriesId} source={source} sourceName={name} />}
    </>
  );
};

export default SeriesSourceLinks;
