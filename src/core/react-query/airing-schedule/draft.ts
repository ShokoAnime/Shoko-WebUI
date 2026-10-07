import { isEmpty, isEqual, omit, sortBy } from 'lodash';

import { axios } from '@/core/axios';
import queryClient, { processError } from '@/core/react-query/queryClient';
import toast from '@/core/toast';

import type { UpdateAiringProvidersRequestType } from '@/core/react-query/airing-schedule/types';
import type { AiringScheduleProviderType, AiringTrackPreferenceType } from '@/core/types/api/airing-schedule';
import type { ConfigurationActionResultType, ConfigurationInfoType } from '@/core/types/api/configuration';

/** The unsaved changes of the airing schedule page, sent on the settings page's Save. A part left out is unchanged. */
export type AiringScheduleDraftType = {
  /** Every provider in its new order, with its new kinds and sweep interval. */
  providers?: AiringScheduleProviderType[];
  /** The preferred channels, best first. */
  channels?: string[];
  /** Every hidden channel's ID; the others are shown. */
  hidden?: string[];
  /** The preferred tracks, best first. */
  tracks?: AiringTrackPreferenceType[];
  /** The service's own options that changed, by member name. */
  options?: Record<string, unknown>;
};

export const emptyAiringScheduleDraft: AiringScheduleDraftType = {};

export const isAiringScheduleDraftEmpty = (draft: AiringScheduleDraftType) => isEmpty(draft);

/** The providers as the server orders them, best first. */
export const sortAiringProviders = (providers: AiringScheduleProviderType[] = []) =>
  sortBy(providers, provider => provider.Priority);

/** The draft with a part set, or the part dropped when it is as the server has it. */
export const withAiringScheduleDraft = <TKey extends keyof AiringScheduleDraftType>(
  draft: AiringScheduleDraftType,
  key: TKey,
  serverValue: AiringScheduleDraftType[TKey],
  value: AiringScheduleDraftType[TKey],
): AiringScheduleDraftType => (isEqual(serverValue, value) ? omit(draft, key) : { ...draft, [key]: value });

/** The draft with an option set, or dropped when it is as the server has it. */
export const withAiringScheduleOption = (
  draft: AiringScheduleDraftType,
  serverOptions: Record<string, unknown>,
  key: string,
  value: unknown,
) => {
  const options = isEqual(serverOptions[key], value) ? omit(draft.options, key) : { ...draft.options, [key]: value };
  return isEmpty(options) ? omit(draft, 'options') : { ...draft, options };
};

const showError = (title: string, error: unknown) => {
  const { message } = processError(error as Error);
  toast.error(title, message);
};

const toProvidersBody = (providers: AiringScheduleProviderType[]): UpdateAiringProvidersRequestType[] =>
  providers.map((provider, index) => ({
    ID: provider.ID,
    Priority: index,
    EnabledKinds: provider.EnabledKinds,
    SweepInterval: provider.SweepInterval,
  }));

// The service's configuration, as `useAiringScheduleConfigurationQuery` read it for the page.
const getConfigurationId = () =>
  queryClient.getQueryData<ConfigurationInfoType>(['airing-schedule', 'configuration'])?.ID;

const saveOptions = async (options: Record<string, unknown>) => {
  const configurationId = getConfigurationId();
  if (!configurationId) throw new Error('The airing schedule configuration is not known.');
  const operations = Object.entries(options).map(([key, value]) => ({ op: 'replace', path: `/${key}`, value }));
  const result = await axios.patch<unknown, ConfigurationActionResultType>(
    `Configuration/${configurationId}`,
    operations,
  );
  const errors = Object.values(result.ValidationErrors ?? {}).flat();
  if (errors.length > 0) throw new Error(errors.join(' '));
};

/**
 * Sends the changes a part at a time: the providers through `POST AiringSchedule/Provider`, the preferences through
 * `PUT AiringSchedule/Channel/Priority` and `PUT AiringSchedule/Track/Priority`, the hidden channels through
 * `PUT AiringSchedule/Channel/Hidden`, and the options as a JSON patch on the service's configuration. A failed request shows the server's error and keeps its part of the draft for another try;
 * the others go on. Refetches what was saved, then returns what is left.
 */
export const saveAiringScheduleDraft = async (draft: AiringScheduleDraftType) => {
  const remaining: AiringScheduleDraftType = { ...draft };
  const parts: { key: keyof AiringScheduleDraftType, title: string, save: () => Promise<unknown> }[] = [];
  if (draft.providers) {
    const { providers } = draft;
    parts.push({
      key: 'providers',
      title: 'The airing schedule providers were not saved!',
      save: () => axios.post('AiringSchedule/Provider', toProvidersBody(providers)),
    });
  }
  if (draft.channels) {
    const { channels } = draft;
    parts.push({
      key: 'channels',
      title: 'The preferred channels were not saved!',
      save: () => axios.put('AiringSchedule/Channel/Priority', channels),
    });
  }
  if (draft.hidden) {
    const { hidden } = draft;
    parts.push({
      key: 'hidden',
      title: 'The channel visibility was not saved!',
      save: () => axios.put('AiringSchedule/Channel/Hidden', hidden),
    });
  }
  if (draft.tracks) {
    const { tracks } = draft;
    parts.push({
      key: 'tracks',
      title: 'The preferred tracks were not saved!',
      save: () => axios.put('AiringSchedule/Track/Priority', tracks),
    });
  }
  if (draft.options) {
    const { options } = draft;
    parts.push({
      key: 'options',
      title: 'The airing schedule options were not saved!',
      save: () => saveOptions(options),
    });
  }

  for (const part of parts) {
    try {
      // oxlint-disable-next-line no-await-in-loop -- one part at a time, so the errors read in order
      await part.save();
      delete remaining[part.key];
    } catch (error) {
      showError(part.title, error);
    }
  }

  // Refetched before the draft goes, so the saved choices never flash back to the old ones.
  await Promise.all([
    queryClient.refetchQueries({ queryKey: ['airing-schedule'] }),
    queryClient.refetchQueries({ queryKey: ['configuration', getConfigurationId()] }),
  ]).catch(console.error);

  return remaining;
};
