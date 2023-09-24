import type { WebUISettingsType } from './types/api/settings';

export const webuiSettingsPatches = {
  5: (oldWebuiSettings) => {
    const webuiSettings = oldWebuiSettings;
    if (oldWebuiSettings.updateChannel === 'unstable') webuiSettings.updateChannel = 'Dev';
    else webuiSettings.updateChannel = 'Stable';
    return { ...webuiSettings, settingsRevision: 5 };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as Record<number, (oldWebuiSettings: any) => WebUISettingsType>;
