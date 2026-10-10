import type { MetadataLinkType } from '@/core/react-query/metadata/types';
import type { MetadataLinkSourceType } from '@/core/types/api/metadata';

/** The route segment for a kind of linked entry. */
export const toRouteKind = (type: MetadataLinkType) => (type === 'Movie' ? 'Movie' : 'Series');

/**
 * The episode picker's first page. The linking page fetches the same page to learn whether a series has episodes, so
 * the picker starts from the cache.
 */
export const episodePickerParams = { search: '', pageSize: 30 };

/** Whether two keys the server matches ignoring case, such as sources, are the same. */
export const isSameKey = (first: string, second: string) => first.toLowerCase() === second.toLowerCase();

/** Whether a source is AniDB, which every series is linked to. */
export const isAnidbSource = (source: string) => isSameKey(source, 'AniDB');

/** Whether a series or a movie can be linked to the source now. */
export const isLinkableSource = (source: MetadataLinkSourceType) => source.IsSeriesEnabled || source.IsMovieEnabled;

/** Whether a source can be searched now, which it cannot while it is not configured or paused. */
export const isSearchableSource = (source: MetadataLinkSourceType) =>
  source.Status.IsConfigured && !source.Status.IsPaused;

/** Whether a source is TMDB, which the series page lists first. */
export const isTmdbSource = (source: string) => isSameKey(source, 'tmdb');
