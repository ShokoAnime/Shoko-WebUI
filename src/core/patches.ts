import { WebUISettingsType } from './types/api/settings';

export const webuiSettingsPatches = {
  5: (oldWebuiSettings) => {
    const webuiSettings = oldWebuiSettings as WebUISettingsType;
    if (oldWebuiSettings.updateChannel === 'unstable') webuiSettings.updateChannel = 'Dev';
    else webuiSettings.updateChannel = 'Stable';
    return { ...webuiSettings, settingsRevision: 5 };
  },
} as Record<number, (any) => WebUISettingsType>;
