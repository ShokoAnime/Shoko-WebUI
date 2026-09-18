/* oxlint-disable typescript/no-unsafe-return */
/* oxlint-disable typescript/no-unsafe-assignment */
/* oxlint-disable typescript/no-unsafe-member-access */
// The shape of persisted settings from older revisions is unknown (and may change between revisions),
// so nearly every line in this file works on an `any` value. The suppressions are file-level because
// per-line disables would repeat on almost every line. Feel free to remove them if you can fix this
// file without deleting it.
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
    // oxlint-disable-next-line typescript/no-unsafe-call -- legacy layout may not have this key
    let layoutItem = webuiSettings.layout.dashboard.lg.find(item => item.i === 'importFolders');
    if (layoutItem) layoutItem.i = 'managedFolders';
    // oxlint-disable-next-line typescript/no-unsafe-call -- legacy layout may not have this key
    layoutItem = webuiSettings.layout.dashboard.md.find(item => item.i === 'importFolders');
    if (layoutItem) layoutItem.i = 'managedFolders';
    return { ...webuiSettings, settingsRevision: 11 };
  },
  // oxlint-disable-next-line typescript/no-explicit-any -- legacy persisted settings have an unknown shape
} as Record<number, (oldWebuiSettings: any) => WebUISettingsType>;
