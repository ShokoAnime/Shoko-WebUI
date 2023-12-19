import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformSettings } from '@/core/react-query/settings/helpers';

import type { SettingsServerType, SettingsType } from '@/core/types/api/settings';

export const useSettingsQuery = (enabled = true) =>
  useQuery<SettingsServerType, unknown, SettingsType>({
    queryKey: ['settings'],
    queryFn: () => axios.get('Settings'),
    select: transformSettings,
    enabled,
  });
