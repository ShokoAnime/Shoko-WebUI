import { useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformListResultSimplified } from '@/core/react-query/helpers';
import { toRouteKind } from '@/core/react-query/metadata/helpers';
import queryClient from '@/core/react-query/queryClient';

import type {
  MetadataLinkType,
  MetadataSearchRequestType,
  MetadataSeriesEpisodesRequestType,
} from '@/core/react-query/metadata/types';
import type { ListResultType } from '@/core/types/api';
import type {
  MetadataAutoSearchResultType,
  MetadataCrossReferenceType,
  MetadataEpisodeType,
  MetadataLinkSourceType,
  MetadataMovieType,
  MetadataSearchResultType,
  MetadataSeriesOrderingType,
} from '@/core/types/api/metadata';

export const useMetadataLinkSourcesQuery = (enabled = true) =>
  useQuery<MetadataLinkSourceType[]>({
    queryKey: ['metadata', 'source'],
    queryFn: () => axios.get('Metadata/Source'),
    enabled,
  });

/**
 * Episodes of a source fetched in bulk. Each fetch is added to one list per
 * source, which rows read from with an empty `ids`.
 */
export const useMetadataBulkEpisodesQuery = (source: string, ids: string[], enabled = true) => {
  const query = useQuery<MetadataEpisodeType[]>({
    queryKey: ['metadata', source, 'episode', 'bulk', ids],
    queryFn: () => axios.post(`Metadata/${source}/Episode/Bulk`, { IDs: ids }),
    enabled: enabled && ids.length > 0,
  });

  useEffect(() => {
    if (!query.data) return;
    queryClient.setQueryData(
      ['metadata', source, 'episode', 'bulk', 'all'],
      (oldData: MetadataEpisodeType[] | undefined) => [...(oldData ?? []), ...query.data],
    );
  }, [query.data, source]);

  const bulkEpisodesQuery = useQuery<MetadataEpisodeType[]>({
    queryKey: ['metadata', source, 'episode', 'bulk', 'all'],
    queryFn: () => [],
    initialData: [],
    staleTime: Infinity,
  });

  return {
    data: bulkEpisodesQuery.data,
    isSuccess: query.isSuccess,
    isPending: query.isPending,
    isFetching: query.isFetching,
  };
};

export const useMetadataLookupQuery = (source: string, type: MetadataLinkType, id: string, enabled = true) =>
  useQuery<MetadataSearchResultType>({
    queryKey: ['metadata', source, 'lookup', type, id],
    queryFn: () => axios.get(`Metadata/${source}/Search/${toRouteKind(type)}/${encodeURIComponent(id)}`),
    enabled: enabled && !!id,
  });

export const useMetadataSearchQuery = (
  source: string,
  type: MetadataLinkType,
  query: string,
  params: MetadataSearchRequestType,
) =>
  useQuery<MetadataSearchResultType[]>({
    queryKey: ['metadata', source, 'search', type, query, params],
    queryFn: async () => {
      const finalData: MetadataSearchResultType[] = [];

      if (/^\d+$/.test(query)) {
        try {
          const idLookupData: MetadataSearchResultType = await axios.get(
            `Metadata/${source}/Search/${toRouteKind(type)}/${query}`,
          );
          finalData.push(idLookupData);
        } catch (_) {
          // Ignore, the source has no entry with the provided ID
        }
      }

      const searchData: ListResultType<MetadataSearchResultType> = await axios.get(`Metadata/${source}/Search`, {
        params: { ...params, kind: type === 'Movie' ? 'movie' : 'series', query },
      });
      finalData.push(...searchData.List.filter(result => !finalData.some(found => found.ID === result.ID)));

      return finalData;
    },
    enabled: query.length > 0,
  });

export const useMetadataSeriesOrderingsQuery = (source: string, seriesId: string, enabled = true) =>
  useQuery<MetadataSeriesOrderingType[]>({
    queryKey: ['metadata', source, 'series', seriesId, 'orderings'],
    queryFn: () => axios.get(`Metadata/${source}/Series/${encodeURIComponent(seriesId)}/Orderings`),
    enabled: enabled && !!seriesId,
  });

export const useMetadataSeriesEpisodesQuery = (
  source: string,
  seriesId: string,
  params: MetadataSeriesEpisodesRequestType,
  enabled = true,
) =>
  useInfiniteQuery<ListResultType<MetadataEpisodeType>>({
    queryKey: ['metadata', source, 'series', seriesId, 'episode', params],
    queryFn: ({ pageParam }) =>
      axios.get(
        `Metadata/${source}/Series/${encodeURIComponent(seriesId)}/Episode`,
        { params: { ...params, page: pageParam as number } },
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam: number) => {
      if (!params.pageSize || lastPage.Total / params.pageSize <= lastPageParam) return undefined;
      return lastPageParam + 1;
    },
    enabled: enabled && !!seriesId,
    staleTime: Infinity,
  });

export const useSeriesMetadataAutoSearchQuery = (seriesId: number, source: string, enabled = true) =>
  useQuery<MetadataAutoSearchResultType[]>({
    queryKey: ['series', seriesId, 'metadata', source, 'auto-search'],
    queryFn: () => axios.get(`Series/${seriesId}/Metadata/${source}/Action/AutoSearch`),
    enabled,
  });

export const useSeriesMetadataCrossReferencesQuery = (seriesId: number, source: string, enabled = true) =>
  useQuery<MetadataCrossReferenceType[]>({
    queryKey: ['series', seriesId, 'metadata', source, 'cross-references'],
    queryFn: () => axios.get(`Series/${seriesId}/Metadata/${source}/CrossReferences`),
    enabled,
  });

export const useSeriesMetadataMoviesQuery = (seriesId: number, source: string, enabled = true) =>
  useQuery<MetadataMovieType[]>({
    queryKey: ['series', seriesId, 'metadata', source, 'movie'],
    queryFn: () => axios.get(`Series/${seriesId}/Metadata/${source}/Movie`),
    enabled,
  });

/**
 * A series' episode links to a source. For a series not linked yet, the links
 * an automatic match against `linkId` would make.
 */
export const useSeriesMetadataEpisodeCrossReferencesQuery = (
  seriesId: number,
  source: string,
  isNewLink: boolean,
  linkId: string,
  enabled = true,
) =>
  useQuery<ListResultType<MetadataCrossReferenceType>, unknown, MetadataCrossReferenceType[]>({
    queryKey: ['series', seriesId, 'metadata', source, 'cross-references', 'episode', isNewLink, linkId],
    queryFn: () =>
      axios.get(
        `Series/${seriesId}/Metadata/${source}/CrossReferences/Episode${isNewLink ? '/Auto' : ''}`,
        { params: { pageSize: 0, parentID: isNewLink ? linkId : undefined } },
      ),
    select: transformListResultSimplified,
    enabled,
  });
