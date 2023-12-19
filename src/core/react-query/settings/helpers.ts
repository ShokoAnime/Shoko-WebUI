import { webuiSettingsPatches } from '@/core/patches';
import { initialSettings } from '@/pages/settings/SettingsPage';

import type { SettingsServerType, SettingsType, WebUISettingsType } from '@/core/types/api/settings';

export const transformSettings = (response: SettingsServerType) => {
  let webuiSettings = JSON.parse(
    response.WebUI_Settings === '' ? '{}' : response.WebUI_Settings,
  ) as WebUISettingsType;
  const settingsRevision = webuiSettings.settingsRevision ?? 0;
  if (settingsRevision < 4) {
    webuiSettings = {
      ...initialSettings.WebUI_Settings,
      settingsRevision: Number(Object.keys(webuiSettingsPatches).pop()),
    };
  } else {
    Object
      .keys(webuiSettingsPatches)
      .map(Number)
      .filter(key => key > settingsRevision)
      .forEach((key) => {
        webuiSettings = webuiSettingsPatches[key](webuiSettings);
      });
    webuiSettings = Object.assign({}, initialSettings.WebUI_Settings, webuiSettings);
  }
  return { ...response, WebUI_Settings: webuiSettings } as SettingsType;
  // For Dev Only
  // return { ...response, WebUI_Settings: initialSettings.WebUI_Settings } as SettingsType;
};
