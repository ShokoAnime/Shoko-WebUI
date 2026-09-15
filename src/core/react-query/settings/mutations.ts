import { useMutation } from '@tanstack/react-query';
import jsonpatch from 'fast-json-patch';

import { axios } from '@/core/axios';
import queryClient, { invalidateQueries } from '@/core/react-query/queryClient';

import type { AniDBLoginRequestType } from '@/core/react-query/settings/types';
import type { SettingsServerType, SettingsType } from '@/core/types/api/settings';
import type { Operation } from 'fast-json-patch';

// Arrays the server exposes through computed properties (e.g. TMDB.ImageLanguageOrder is converted to and from a
// list of enum values). The server applies patch operations on individual items to a temporary copy, so they are
// silently lost; such arrays must be replaced as a whole.
const computedArrayPaths = ['/TMDB/ImageLanguageOrder'];

const replaceComputedArrays = (operations: Operation[], changed: SettingsServerType) => {
  let result = operations;
  for (const path of computedArrayPaths) {
    const isItemOperation = (operation: Operation) => operation.path.startsWith(`${path}/`);
    if (result.some(isItemOperation)) {
      result = [
        ...result.filter(operation => !isItemOperation(operation)),
        { op: 'replace', path, value: jsonpatch.getValueByPointer(changed, path) as unknown },
      ];
    }
  }
  return result;
};

export const useAniDBTestLoginMutation = () =>
  useMutation({
    mutationFn: (body: AniDBLoginRequestType) => axios.post('Settings/AniDB/TestLogin', body),
  });

export const useCheckNetworkConnectivityMutation = () =>
  useMutation({
    mutationFn: () => axios.post('Init/Connectivity'),
  });

export const usePatchSettingsMutation = () =>
  useMutation({
    mutationFn: (newSettings: SettingsType) => {
      const oldSettings = queryClient.getQueryData<SettingsType>(['settings'])!;
      const original: SettingsServerType = {
        ...oldSettings,
        WebUI_Settings: JSON.stringify(oldSettings.WebUI_Settings),
      };
      const changed: SettingsServerType = {
        ...newSettings,
        WebUI_Settings: JSON.stringify(newSettings.WebUI_Settings),
      };
      const data = replaceComputedArrays(jsonpatch.compare(original, changed), changed);
      return axios.patch('Settings', data);
    },
    onSuccess: () => invalidateQueries(['settings']),
  });
