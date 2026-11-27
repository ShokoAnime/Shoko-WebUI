import jsonpatch from 'fast-json-patch';
import { isEmpty, isEqual, omit, sortBy } from 'lodash';

import { axios } from '@/core/axios';
import queryClient, { processError } from '@/core/react-query/queryClient';
import toast from '@/core/toast';

import type { UpdateAiringProvidersRequestType } from '@/core/react-query/airing-schedule/types';
import type { AiringScheduleProviderType } from '@/core/types/api/airing-schedule';
import type { ConfigurationActionResultType, ConfigurationInfoType } from '@/core/types/api/configuration';

/** The unsaved changes of the airing schedule settings, sent on the settings page's Save. A part left out is unchanged. */
export type AiringScheduleDraftType = {
  providers?: AiringScheduleProviderType[];
  options?: Record<string, unknown>;
};

export const emptyAiringScheduleDraft: AiringScheduleDraftType = {};

export const isAiringScheduleDraftEmpty = (draft: AiringScheduleDraftType) => isEmpty(draft);

export const sortAiringProviders = (providers: AiringScheduleProviderType[] = []) =>
  sortBy(providers, provider => provider.Priority);

export const withAiringProviders = (
  draft: AiringScheduleDraftType,
  serverProviders: AiringScheduleProviderType[],
  providers: AiringScheduleProviderType[],
): AiringScheduleDraftType => (isEqual(serverProviders, providers)
  ? omit(draft, 'providers')
  : { ...draft, providers });

export const withAiringOption = (
  draft: AiringScheduleDraftType,
  serverOptions: Record<string, unknown>,
  key: string,
  value: unknown,
): AiringScheduleDraftType => {
  const options = isEqual(serverOptions[key], value) ? omit(draft.options, key) : { ...draft.options, [key]: value };
  return isEmpty(options) ? omit(draft, 'options') : { ...draft, options };
};

const trySave = async (title: string, save: () => Promise<unknown>) => {
  try {
    await save();
    return true;
  } catch (error) {
    toast.error(title, processError(error as Error).message);
    return false;
  }
};

const saveOptions = async (configurationId: string, options: Record<string, unknown>) => {
  const server = queryClient.getQueryData<Record<string, unknown>>(['configuration', configurationId]) ?? {};
  const result = await axios.patch<unknown, ConfigurationActionResultType>(
    `Configuration/${configurationId}`,
    jsonpatch.compare(server, { ...server, ...options }),
  );
  const errors = Object.values(result.ValidationErrors ?? {}).flat();
  if (errors.length > 0) throw new Error(errors.join(' '));
};

/**
 * Sends the changes a part at a time: the providers through `POST AiringSchedule/Provider` and the options as a JSON
 * patch on the service's configuration. A failed part shows the server's error and stays in the draft for another try,
 * while the other is still sent. Refetches what was saved, then returns what is left.
 */
export const saveAiringScheduleDraft = async (draft: AiringScheduleDraftType) => {
  const remaining = { ...draft };
  const configurationId = queryClient.getQueryData<ConfigurationInfoType>(['airing-schedule', 'configuration'])?.ID;

  if (draft.providers) {
    const body: UpdateAiringProvidersRequestType[] = draft.providers.map((provider, index) => ({
      ID: provider.ID,
      Priority: index,
      EnabledKinds: provider.EnabledKinds,
      SweepInterval: provider.SweepInterval,
    }));
    if (
      await trySave('The airing schedule providers were not saved!', () => axios.post('AiringSchedule/Provider', body))
    ) {
      delete remaining.providers;
    }
  }

  if (draft.options && configurationId) {
    const { options } = draft;
    if (await trySave('The airing schedule options were not saved!', () => saveOptions(configurationId, options))) {
      delete remaining.options;
    }
  }

  // Refetched before the draft goes, so the saved choices never flash back to the old ones.
  await Promise.all([
    queryClient.refetchQueries({ queryKey: ['airing-schedule'] }),
    queryClient.refetchQueries({ queryKey: ['configuration'] }),
  ]).catch(console.error);

  return remaining;
};
