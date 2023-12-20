import { useMutation } from '@tanstack/react-query';
import jsonpatch from 'fast-json-patch';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type { AniDBLoginRequestType, SettingsPatchRequestType } from '@/core/react-query/settings/types';
import type { SettingsServerType } from '@/core/types/api/settings';

export const useAniDBTestLoginMutation = () =>
  useMutation({
    mutationFn: (body: AniDBLoginRequestType) => axios.post('Settings/AniDB/TestLogin', body),
  });

export const useCheckNetworkConnectivityMutation = () =>
  useMutation({
    mutationFn: () => axios.post('Settings/Connectivity'),
  });

export const usePatchSettingsMutation = () =>
  useMutation({
    mutationFn: ({ newSettings, oldSettings, ...params }: SettingsPatchRequestType) => {
      const original: SettingsServerType = {
        ...oldSettings,
        WebUI_Settings: JSON.stringify(oldSettings.WebUI_Settings),
      };
      const changed: SettingsServerType = {
        ...newSettings,
        WebUI_Settings: JSON.stringify(newSettings.WebUI_Settings),
      };
      const data = jsonpatch.compare(original, changed);
      return axios.patch('Settings', data, { params });
    },
    onSuccess: () => invalidateQueries(['settings']),
  });
