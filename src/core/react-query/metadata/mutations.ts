import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { toRouteKind } from '@/core/react-query/metadata/helpers';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type {
  MetadataAddLinkRequestType,
  MetadataDeleteLinkRequestType,
  MetadataEditEpisodeLinksRequestType,
  MetadataLinkType,
  MetadataProviderUpdateRequestType,
  MetadataRefreshRequestType,
} from '@/core/react-query/metadata/types';

export const useUpdateMetadataProviderMutation = () =>
  useMutation({
    mutationFn: ({ providerId, ...data }: MetadataProviderUpdateRequestType) =>
      axios.put(`Metadata/Provider/${providerId}`, data),
    onSuccess: () => {
      invalidateQueries(['metadata', 'provider']);
      invalidateQueries(['metadata', 'source']);
    },
  });

export const useMetadataRefreshMutation = (source: string, type: MetadataLinkType) =>
  useMutation({
    mutationFn: ({ id, ...data }: MetadataRefreshRequestType) =>
      axios.post(`Metadata/${source}/${toRouteKind(type)}/${encodeURIComponent(id)}/Action/Refresh`, data),
  });

export const useSetPreferredMetadataOrderingMutation = (source: string, seriesId: string) =>
  useMutation({
    mutationFn: (orderingId: string | null) =>
      axios.post(`Metadata/${source}/Series/${encodeURIComponent(seriesId)}/Orderings/SetPreferred`, {
        OrderingID: orderingId,
      }),
    onSuccess: () => {
      invalidateQueries(['metadata', source, 'series', seriesId]);
      invalidateQueries(['metadata', source, 'episode']);
    },
  });

export const useSeriesMetadataAddLinkMutation = (seriesId: number, source: string, type: MetadataLinkType) =>
  useMutation({
    mutationFn: (data: MetadataAddLinkRequestType) =>
      axios.post(`Series/${seriesId}/Metadata/${source}/${toRouteKind(type)}`, data),
  });

export const useSeriesMetadataDeleteLinkMutation = (seriesId: number, source: string, type: MetadataLinkType) =>
  useMutation({
    mutationFn: (data: MetadataDeleteLinkRequestType) =>
      axios.delete(`Series/${seriesId}/Metadata/${source}/${toRouteKind(type)}`, { data }),
  });

export const useSeriesMetadataEditEpisodeLinksMutation = (seriesId: number, source: string) =>
  useMutation({
    mutationFn: (data: MetadataEditEpisodeLinksRequestType) =>
      axios.post(`Series/${seriesId}/Metadata/${source}/CrossReferences/Episode`, data),
  });
