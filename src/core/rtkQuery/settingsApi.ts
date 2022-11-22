import jsonpatch from 'fast-json-patch';

import { splitV3Api } from './splitV3Api';

import type { SettingsServerType, SettingsType } from '../types/api/settings';
import { SettingsAnidbLoginType } from '../types/api/settings';
import { initialSettings } from '../../pages/settings/SettingsPage';

const settingsApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    // Get all settings
    getSettings: build.query<SettingsType, void>({
      query: () => ({ url: 'Settings' }),
      transformResponse: (response: SettingsServerType) => {
        let webuiSettings = JSON.parse(response.WebUI_Settings === '' ? '{}' : response.WebUI_Settings);
        const settingsRevision = webuiSettings.settingsRevision ?? 0;
        const newSettingsRevision = 4;
        if (settingsRevision !== newSettingsRevision) webuiSettings = { ...initialSettings.WebUI_Settings, settingsRevision: newSettingsRevision }; // TO-DO: Move the settings revision number somewhere else
        else webuiSettings = Object.assign({}, initialSettings.WebUI_Settings, webuiSettings);
        return { ...response, WebUI_Settings: webuiSettings };
      },
      providesTags: ['Settings'],
    }),

    // JsonPatch the settings
    patchSettings: build.mutation<void, { oldSettings: SettingsType, newSettings: SettingsType, skipValidation?: boolean }>({
      query: ({ oldSettings, newSettings, ...params }) => {
        const original: SettingsServerType = { ...oldSettings, WebUI_Settings: JSON.stringify(oldSettings.WebUI_Settings) };
        const changed: SettingsServerType = { ...newSettings, WebUI_Settings: JSON.stringify(newSettings.WebUI_Settings) };
        const postData = jsonpatch.compare(original, changed);
        return {
          url: 'Settings',
          method: 'PATCH',
          body: postData,
          params,
        };
      },
      invalidatesTags: ['Settings'],
    }),

    // Tests a Login with the given Credentials. This does not save the credentials.
    postAniDBTestLogin: build.mutation<string, SettingsAnidbLoginType>({
      query: params => ({
        url: 'Settings/AniDB/TestLogin',
        method: 'POST',
        body: params,
        responseHandler: 'text',
      }),
    }),
  }),
});

export const {
  useGetSettingsQuery,
  usePatchSettingsMutation,
  usePostAniDBTestLoginMutation,
} = settingsApi;
