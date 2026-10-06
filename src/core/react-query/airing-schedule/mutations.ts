import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import queryClient from '@/core/react-query/queryClient';

import type { MergeAiringChannelsRequestType } from '@/core/react-query/airing-schedule/types';
import type { AiringChannelType } from '@/core/types/api/airing-schedule';

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
