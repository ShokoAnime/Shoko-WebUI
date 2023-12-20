import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformSettings } from '@/core/react-query/settings/helpers';

import type { SettingsServerType, SettingsType } from '@/core/types/api/settings';

export const useSettingsQuery = (enabled = true) =>
  useQuery<SettingsServerType, unknown, SettingsType>({
    queryKey: ['settings'],
    queryFn: () => axios.get('Settings'),
    select: transformSettings,
    // I don't see a point it making it refetch every time we change the page or something.
    // It will be invalidated when we actually save the settings
    // Can be made better if the SettingSaved even is emitted from the server
    staleTime: Infinity,
    enabled,
  });
