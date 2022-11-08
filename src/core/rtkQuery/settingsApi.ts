import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';

import type { RootState } from '../store';
import type { SettingsServerType, SettingsType } from '../types/api/settings';
import jsonpatch from 'fast-json-patch';
import { SettingsAnidbLoginType } from '../types/api/settings';
import { initialSettings } from '../../pages/settings/SettingsPage';

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  tagTypes: ['Settings'],
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v3/Settings',
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
        let webuiSettings = JSON.parse(response.WebUI_Settings === '' ? '{}' : response.WebUI_Settings);
        const settingsRevision = webuiSettings.settingsRevision ?? 0;
        if (settingsRevision !== 2) webuiSettings = { ...initialSettings.WebUI_Settings, settingsRevision: 2 }; // TO-DO: Move the settings revision number somewhere else
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
          url: '',
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
        url: '/AniDB/TestLogin',
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
