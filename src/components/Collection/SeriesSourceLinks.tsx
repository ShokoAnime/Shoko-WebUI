import { uniqBy } from 'lodash';

import SeriesMetadata from '@/components/Collection/SeriesMetadata';
import { useSeriesMetadataCrossReferencesQuery } from '@/core/react-query/metadata/queries';

import type { MetadataLinkType } from '@/core/react-query/metadata/types';

type Props = {
  /** Whether the source can be linked to now, which adds a row to link it. */
  canLink: boolean;
  /** The IDs the series is linked to on the source, from the series' `IDs.Linked`. */
  linkedIds: string[];
  name: string;
  seriesId: number;
  source: string;
};

const isLinkType = (entityType: string): entityType is MetadataLinkType =>
  entityType === 'Show' || entityType === 'Movie';

/** A series' links to one source other than AniDB and TMDB, and a row to add one. */
const SeriesSourceLinks = ({ canLink, linkedIds, name, seriesId, source }: Props) => {
  // The series only lists the linked IDs, so the cross-references tell whether each is a series or a movie.
  const crossReferencesQuery = useSeriesMetadataCrossReferencesQuery(seriesId, source, linkedIds.length > 0);

  const links: { id: string, type?: MetadataLinkType }[] = crossReferencesQuery.data
    ? uniqBy(
      crossReferencesQuery.data.flatMap(xref => (xref.ID && isLinkType(xref.EntityType)
        ? [{ id: xref.ID, type: xref.EntityType }]
        : [])
      ),
      link => `${link.type}-${link.id}`,
    )
    : linkedIds.map(id => ({ id }));

  return (
    <>
      {links.map(link => (
        <SeriesMetadata
          key={`${source}-${link.type}-${link.id}`}
          id={link.id}
          seriesId={seriesId}
          site={source}
          siteName={name}
          type={link.type}
        />
      ))}
      {canLink && <SeriesMetadata seriesId={seriesId} site={source} siteName={name} />}
    </>
  );
};

export default SeriesSourceLinks;
