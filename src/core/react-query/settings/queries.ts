import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { initialSettings, transformSettings, transformSupportedLanguages } from '@/core/react-query/settings/helpers';

import type { SupportedLanguagesResponseType } from '@/core/react-query/settings/types';
import type { SettingsServerType, SettingsType } from '@/core/types/api/settings';

export const useSettingsQuery = (enabled = true) =>
  useQuery<SettingsServerType, unknown, SettingsType>({
    queryKey: ['settings'],
    queryFn: () => axios.get('Settings'),
    select: transformSettings,
    initialData: () => ({
      ...initialSettings,
      WebUI_Settings: JSON.stringify(initialSettings.WebUI_Settings),
    }),
    // I don't see a point it making it refetch every time we change the page or something.
    // It will be invalidated when we actually save the settings
    // Can be made better if the SettingSaved event is emitted from the server
    staleTime: 86400 * 100000,
    // If we set staleTime to Infinity, initialData will always be considered "fresh"
    // For initialData to be considered as placeholderData but also to not let the data be undefined unlike
    // placeholderData we need to set initialDataUpdatedAt to some timestamp less than current time minus staleTime
    // So setting initialDataUpdatedAt to 0 and staleTime to something effectively infinite
    initialDataUpdatedAt: 0,
    enabled,
  });

export const useSupportedLanguagesQuery = () =>
  useQuery<SupportedLanguagesResponseType, unknown, Record<string, string>>({
    queryKey: ['settings', 'supported-languages'],
    queryFn: () => axios.get('Settings/SupportedLanguages'),
    select: transformSupportedLanguages,
    // This won't change while the server is running
    staleTime: Infinity,
  });
