/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// Feel free to to remove the above lines if you can fix this file without deleting it.
// oldWebuiSettings's actual type is unknown
import type { WebUISettingsType } from './types/api/settings';

export const webuiSettingsPatches = {
  5: (oldWebuiSettings) => {
    const webuiSettings = oldWebuiSettings;
    if (oldWebuiSettings.updateChannel === 'unstable') webuiSettings.updateChannel = 'Dev';
    else webuiSettings.updateChannel = 'Stable';
    return { ...webuiSettings, settingsRevision: 5 };
  },
  6: (oldWebuiSettings) => {
    const webuiSettings = oldWebuiSettings;
    delete webuiSettings.collection.list.showRandomPoster;
    delete webuiSettings.collection.poster.showRandomPoster;
    webuiSettings.collection.image = {
      showRandomPoster:
        (oldWebuiSettings?.collection?.list?.showRandomPoster || oldWebuiSettings?.collection?.poster?.showRandomPoster)
          ?? false,
      showRandomFanart: false,
    };
    return { ...webuiSettings, settingsRevision: 6 };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as Record<number, (oldWebuiSettings: any) => WebUISettingsType>;
