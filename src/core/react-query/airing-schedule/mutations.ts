import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import queryClient from '@/core/react-query/queryClient';
import { downloadBlob } from '@/core/util';

import type { MergeAiringChannelsRequestType } from '@/core/react-query/airing-schedule/types';
import type { AiringChannelType } from '@/core/types/api/airing-schedule';
import type {
  StartSeasonImportSummaryType,
  StartSeasonType,
  StartSeasonValueType,
} from '@/core/types/api/airing-season';

// Settled once the channel lists are in again, so a closing modal never shows the old ones.
const refetchChannels = () =>
  Promise.all([
    queryClient.refetchQueries({ queryKey: ['airing-schedule', 'channels'] }),
    queryClient.refetchQueries({ queryKey: ['airing-schedule', 'channel-priority'] }),
  ]);

/**
 * Merges channels into one through `POST AiringSchedule/Channel/{channelID}/Merge`: their names become its aliases and
 * their schedules move to it. Admin only.
 */
export const useMergeAiringChannelsMutation = () =>
  useMutation({
    mutationFn: ({ channelId, sourceIds }: { channelId: string, sourceIds: string[] }) =>
      axios.post<unknown, AiringChannelType>(
        `AiringSchedule/Channel/${channelId}/Merge`,
        { SourceIDs: sourceIds } satisfies MergeAiringChannelsRequestType,
      ),
    onSuccess: refetchChannels,
  });

/** Replaces a channel's aliases through `PUT AiringSchedule/Channel/{channelID}/Aliases`. Admin only. */
export const useUpdateAiringChannelAliasesMutation = () =>
  useMutation({
    mutationFn: ({ aliases, channelId }: { channelId: string, aliases: string[] }) =>
      axios.put<unknown, AiringChannelType>(`AiringSchedule/Channel/${channelId}/Aliases`, aliases),
    onSuccess: refetchChannels,
  });

// An override moves an anime between seasons, so every season list and count is read again, with the overrides.
const refetchSeasons = () =>
  Promise.all(
    ['season', 'seasons', 'seasons-by-year', 'start-season', 'start-season-overrides'].map(key =>
      queryClient.refetchQueries({ queryKey: ['airing-schedule', key] })
    ),
  );

/** Sets an anime's start season through `PUT Series/AniDB/{anidbID}/StartSeason`. Admin only. */
export const useSetStartSeasonMutation = () =>
  useMutation({
    mutationFn: ({ anidbId, value }: { anidbId: number, value: StartSeasonValueType }) =>
      axios.put<unknown, StartSeasonType>(`Series/AniDB/${anidbId}/StartSeason`, value),
    onSuccess: refetchSeasons,
  });

/** Clears an anime's start season override through `DELETE Series/AniDB/{anidbID}/StartSeason`. Admin only. */
export const useResetStartSeasonMutation = () =>
  useMutation({
    mutationFn: (anidbId: number) => axios.delete(`Series/AniDB/${anidbId}/StartSeason`),
    onSuccess: refetchSeasons,
  });

/** Downloads the overrides from `GET Series/AniDB/StartSeason/Overrides.csv`. */
export const useExportStartSeasonOverridesMutation = () =>
  useMutation({
    mutationFn: () => axios.get<Blob, Blob>('Series/AniDB/StartSeason/Overrides.csv', { responseType: 'blob' }),
    // The shared axios instance hands back the body only, so the file is named here.
    onSuccess: blob => downloadBlob(blob, 'start_season_overrides.csv'),
  });

/** Imports overrides from a CSV file through `POST Series/AniDB/StartSeason/Overrides.csv`. Admin only. */
export const useImportStartSeasonOverridesMutation = () =>
  useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return axios.post<unknown, StartSeasonImportSummaryType>('Series/AniDB/StartSeason/Overrides.csv', formData);
    },
    onSuccess: refetchSeasons,
  });
