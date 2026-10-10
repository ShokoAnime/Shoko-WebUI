import type { MetadataLinkType } from '@/core/react-query/metadata/types';

/** The route segment for a kind of linked entry. */
export const toRouteKind = (type: MetadataLinkType) => (type === 'Movie' ? 'Movie' : 'Series');

/**
 * The episode picker's first page. The linking page fetches the same page to learn whether a series has episodes, so
 * the picker starts from the cache.
 */
export const episodePickerParams = { search: '', pageSize: 30 };

/** Whether two keys the server matches ignoring case, such as sources, are the same. */
export const isSameKey = (first: string, second: string) => first.toLowerCase() === second.toLowerCase();

/** Whether a source is TMDB, which has extras of its own on the linking page. */
export const isTmdbSource = (source: string) => isSameKey(source, 'tmdb');
