import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { toRouteKind } from '@/core/react-query/metadata/helpers';
import { invalidateQueries } from '@/core/react-query/queryClient';
import toast from '@/core/toast';
import { downloadBlob } from '@/core/util';

import type {
  MetadataAddLinkRequestType,
  MetadataDeleteLinkRequestType,
  MetadataEditEpisodeLinksRequestType,
  MetadataExportRequestType,
  MetadataImportRequestType,
  MetadataLinkType,
  MetadataProviderUpdateRequestType,
  MetadataRefreshRequestType,
} from '@/core/react-query/metadata/types';
import type { MetadataImportSummaryType } from '@/core/types/api/metadata';

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

export const useExportMetadataCrossReferencesMutation = (source: string, sourceName: string) =>
  useMutation({
    mutationFn: async (data: MetadataExportRequestType) => {
      const blob = await axios.post<Blob, Blob>(
        `Metadata/${encodeURIComponent(source)}/CrossReferences/Export`,
        data,
        { responseType: 'blob' },
      );
      // A section is only written when it has links, so nothing matched leaves at most blank lines.
      const isEmpty = (await blob.text()).trim().length === 0;
      return { blob, isEmpty };
    },
    onSuccess: ({ blob, isEmpty }) => {
      if (isEmpty) {
        toast.info('Nothing to export', 'No cross-references matched the selected options.');
        return;
      }
      toast.success(`${sourceName} cross-references exported!`);
      // The shared axios instance unwraps response.data, so the Content-Disposition header
      // is not reachable; use the same filename the server sends.
      downloadBlob(blob, `anidb_${source.toLowerCase()}_xrefs.csv`);
    },
    onError: () => toast.error(`Failed to export ${sourceName} cross-references!`),
  });

const describeImport = (summary: MetadataImportSummaryType) => {
  const added = summary.MoviesAdded + summary.SeriesAdded + summary.EpisodesAdded;
  const updated = summary.MoviesUpdated + summary.EpisodesUpdated;
  const removed = summary.MoviesRemoved + summary.EpisodesRemoved;
  const kept = summary.MoviesKept + summary.EpisodesKept;
  const refreshes = summary.RefreshesQueued > 0 ? ` ${summary.RefreshesQueued} entries queued to download.` : '';
  return `${summary.LinkCount} links read: ${added} added, ${updated} updated, ${kept} kept and ${removed} replaced.${refreshes}`;
};

export const useImportMetadataCrossReferencesMutation = (source: string, sourceName: string) =>
  useMutation({
    mutationFn: ({ file, ...params }: MetadataImportRequestType) => {
      const formData = new FormData();
      formData.append('file', file);
      return axios.post<unknown, MetadataImportSummaryType>(
        `Metadata/${encodeURIComponent(source)}/CrossReferences/Import`,
        formData,
        { params },
      );
    },
    onSuccess: (summary) => {
      toast.success(`${sourceName} cross-references imported!`, describeImport(summary));
      // Imported links can touch any series and any stored entry of the source.
      invalidateQueries(['series']);
      invalidateQueries(['metadata']);
      // "Missing TMDB Links" count.
      invalidateQueries(['dashboard', 'stats']);
    },
    onError: () => toast.error(`Failed to import ${sourceName} cross-references!`),
  });
