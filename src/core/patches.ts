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
        (oldWebuiSettings.collection.list.showRandomPoster || oldWebuiSettings.collection.poster.showRandomPoster)
          ?? false,
      showRandomFanart: false,
    };
    return { ...webuiSettings, settingsRevision: 6 };
  },
  7: (oldWebuiSettings) => {
    const webuiSettings = oldWebuiSettings;
    webuiSettings.collection.image.useThumbnailFallback = false;
    return { ...webuiSettings, settingsRevision: 7 };
  },
  8: (oldWebuiSettings) => {
    const webuiSettings = oldWebuiSettings;
    webuiSettings.collection.image.showRandomBackdrop = webuiSettings.collection.image.showRandomFanart;
    delete webuiSettings.collection.image.showRandomFanart;
    return { ...webuiSettings, settingsRevision: 8 };
  },
  9: (oldWebuiSettings) => {
    const webuiSettings = oldWebuiSettings;
    webuiSettings.collection.tmdb.includeRestricted = false;
    return { ...webuiSettings, settingsRevision: 9 };
  },
  10: (oldWebuiSettings) => {
    const webuiSettings = oldWebuiSettings;
    webuiSettings.collection.anidb.filterDescription = false;
    return { ...webuiSettings, settingsRevision: 10 };
  },
  11: (oldWebuiSettings) => {
    const webuiSettings = oldWebuiSettings;
    webuiSettings.dashboard.hideManagedFolders = webuiSettings.dashboard.hideImportFolders;
    delete webuiSettings.dashboard.hideImportFolders;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    let layoutItem = webuiSettings.layout.dashboard.lg.find(item => item.i === 'importFolders');
    if (layoutItem) layoutItem.i = 'managedFolders';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    layoutItem = webuiSettings.layout.dashboard.md.find(item => item.i === 'importFolders');
    if (layoutItem) layoutItem.i = 'managedFolders';
    return { ...webuiSettings, settingsRevision: 11 };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as Record<number, (oldWebuiSettings: any) => WebUISettingsType>;
