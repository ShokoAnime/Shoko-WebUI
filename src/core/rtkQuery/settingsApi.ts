import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';

import type { RootState } from '../store';
import type { SettingsServerType, SettingsType } from '../types/api/settings';
import jsonpatch from 'fast-json-patch';
import { SettingsAnidbLoginType } from '../types/api/settings';

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v3/Settings/',
    prepareHeaders: (headers, { getState }) => {
      const apikey = (getState() as RootState).apiSession.apikey;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  endpoints: build => ({
    // Get all settings
    getSettings: build.query<SettingsType, void>({
      query: () => ({ url: '' }),
      transformResponse: (response: SettingsServerType) => {
        let webuiSettings = JSON.parse(response.WebUI_Settings ?? '{}');
        const settingsRevision = webuiSettings.settingsRevision ?? 0;
        if (settingsRevision !== 1) webuiSettings = { settingsRevision: 1 }; // TO-DO: Move the settings revision number somewhere else
        return { ...response, WebUI_Settings: webuiSettings };
      },
    }),

    // JsonPatch the settings
    patchSettings: build.mutation<void, { oldSettings: SettingsType, newSettings: SettingsType }>({
      query: (params) => {
        const { oldSettings, newSettings } = params;
        const original: SettingsServerType = { ...oldSettings, WebUI_Settings: JSON.stringify(oldSettings.WebUI_Settings) };
        const changed: SettingsServerType = { ...newSettings, WebUI_Settings: JSON.stringify(newSettings.WebUI_Settings) };
        const postData = jsonpatch.compare(original, changed);
        return {
          url: '',
          method: 'PATCH',
          body: postData,
        };
      },
    }),

    // Tests a Login with the given Credentials. This does not save the credentials.
    postAniDBTestLogin: build.mutation<string, SettingsAnidbLoginType>({
      query: params => ({
        url: 'AniDB/TestLogin',
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
