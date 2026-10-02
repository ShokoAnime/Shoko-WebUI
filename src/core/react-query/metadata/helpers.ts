import type { MetadataLinkType } from '@/core/react-query/metadata/types';

/** The route segment for a kind of linked entry. */
export const toRouteKind = (type: MetadataLinkType) => (type === 'Movie' ? 'Movie' : 'Series');

/** Whether a source is TMDB, which has extras of its own on the linking page. */
export const isTmdbSource = (source: string) => source.toLowerCase() === 'tmdb';
