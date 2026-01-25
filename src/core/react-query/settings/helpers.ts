import { merge } from 'lodash';
import semver from 'semver';

import { webuiSettingsPatches } from '@/core/patches';
import { LanguageSource } from '@/core/types/api/settings';
import { uiVersion } from '@/core/util';

import type { SupportedLanguagesResponseType } from '@/core/react-query/settings/types';
import type { SettingsServerType, SettingsType, WebUISettingsType } from '@/core/types/api/settings';

const initialLayout = {
  dashboard: {
    lg: [
      {
        i: 'queueProcessor',
        x: 0,
        y: 0,
        w: 6,
        h: 19.75,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'unrecognizedFiles',
        x: 6,
        y: 0,
        w: 6,
        h: 19.75,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'recentlyImported',
        x: 0,
        y: 16,
        w: 12,
        h: 22.7,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'collectionBreakdown',
        x: 0,
        y: 37,
        w: 3,
        h: 21.8,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'collectionTypeBreakdown',
        x: 3,
        y: 37,
        w: 3,
        h: 21.8,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'importFolders',
        x: 6,
        y: 37,
        w: 3,
        h: 21.8,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'shokoNews',
        x: 9,
        y: 37,
        w: 3,
        h: 21.8,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'continueWatching',
        x: 0,
        y: 53,
        w: 12,
        h: 22.7,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'nextUp',
        x: 0,
        y: 67,
        w: 12,
        h: 22.7,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'upcomingAnime',
        x: 0,
        y: 81,
        w: 12,
        h: 25,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'recommendedAnime',
        x: 0,
        y: 103,
        w: 12,
        h: 22.7,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
    ],
    md: [
      {
        i: 'collectionBreakdown',
        x: 0,
        y: 0,
        w: 5,
        h: 21.8,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'collectionTypeBreakdown',
        x: 5,
        y: 0,
        w: 5,
        h: 21.8,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'queueProcessor',
        x: 0,
        y: 16,
        w: 10,
        h: 16,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'recentlyImported',
        x: 0,
        y: 32,
        w: 10,
        h: 22.7,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'shokoNews',
        x: 0,
        y: 51,
        w: 5,
        h: 21.8,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'importFolders',
        x: 5,
        y: 51,
        w: 5,
        h: 21.8,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'unrecognizedFiles',
        x: 0,
        y: 65,
        w: 10,
        h: 19.75,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'continueWatching',
        x: 0,
        y: 79,
        w: 10,
        h: 22.7,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'nextUp',
        x: 0,
        y: 98,
        w: 10,
        h: 22.7,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'upcomingAnime',
        x: 0,
        y: 117,
        w: 10,
        h: 25,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'recommendedAnime',
        x: 0,
        y: 138,
        w: 10,
        h: 22.7,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
    ],
  },
};

export const initialSettings: SettingsType = {
  WebUI_Settings: {
    notifications: true,
    settingsRevision: 0,
    theme: 'theme-shoko-gray',
    toastPosition: 'bottom-right',
    updateChannel: semver.prerelease(uiVersion()) ? 'Dev' : 'Stable',
    layout: initialLayout,
    collection: {
      view: 'poster',
      poster: {
        showEpisodeCount: true,
        showGroupIndicator: true,
        showUnwatchedCount: true,
      },
      list: {
        showItemType: true,
        showGroupIndicator: true,
        showTopTags: true,
        showCustomTags: true,
      },
      image: {
        showRandomBackdrop: false,
        showRandomPoster: false,
        useThumbnailFallback: false,
      },
      tmdb: {
        includeRestricted: false,
      },
      anidb: {
        filterDescription: false,
      },
    },
    dashboard: {
      hideQueueProcessor: false,
      hideUnrecognizedFiles: false,
      hideRecentlyImported: false,
      hideCollectionStats: false,
      hideMediaType: false,
      hideImportFolders: false,
      hideShokoNews: false,
      hideContinueWatching: false,
      hideNextUp: false,
      hideUpcomingAnime: false,
      hideRecommendedAnime: false,
      combineContinueWatching: false,
      useThumbnailsForEpisodes: false,
      hideR18Content: true,
      shokoNewsPostsCount: 5,
      recentlyImportedEpisodesCount: 30,
      recentlyImportedSeriesCount: 20,
      recentlyImportedView: 'episodes',
      upcomingAnimeView: 'collection',
    },
  },
  FirstRun: false,
  Database: {
    MySqliteDirectory: '',
    DatabaseBackupDirectory: '',
    Type: 'SQLite',
    Username: '',
    Password: '',
    Schema: '',
    Hostname: '',
    SQLite_DatabaseFile: '',
  },
  AniDb: {
    Username: '',
    Password: '',
    AVDumpKey: '',
    ClientPort: 4556,
    AVDumpClientPort: 4557,
    HTTPServerUrl: '',
    UDPServerAddress: '',
    UDPServerPort: 9000,
    DownloadCharacters: false,
    DownloadCreators: false,
    DownloadRelatedAnime: false,
    DownloadReleaseGroups: false,
    MaxRelationDepth: 0,
    MyList_AddFiles: false,
    MyList_DeleteType: 0,
    MyList_ReadUnwatched: false,
    MyList_ReadWatched: false,
    MyList_SetUnwatched: false,
    MyList_SetWatched: false,
    MyList_StorageState: 0,
    Calendar_UpdateFrequency: 1,
    Anime_UpdateFrequency: 1,
    MyList_UpdateFrequency: 1,
    File_UpdateFrequency: 1,
    Notification_UpdateFrequency: 1,
    Notification_HandleMovedFiles: false,
  },
  TMDB: {
    AutoLink: false,
    AutoLinkRestricted: false,
    DownloadAllTitles: false,
    DownloadAllOverviews: false,
    AutoDownloadCrewAndCast: false,
    AutoDownloadCollections: false,
    AutoDownloadAlternateOrdering: false,
    AutoDownloadBackdrops: true,
    MaxAutoBackdrops: 10,
    AutoDownloadPosters: true,
    MaxAutoPosters: 10,
    AutoDownloadLogos: true,
    MaxAutoLogos: 10,
    AutoDownloadThumbnails: true,
    MaxAutoThumbnails: 10,
    AutoDownloadStaffImages: true,
    MaxAutoStaffImages: 10,
    AutoDownloadStudioImages: true,
    UserApiKey: null,
  },
  Language: {
    UseSynonyms: false,
    SeriesTitleLanguageOrder: ['x-main'],
    SeriesTitleSourceOrder: [LanguageSource.AniDB, LanguageSource.TMDB],
    EpisodeTitleLanguageOrder: ['en'],
    EpisodeTitleSourceOrder: [LanguageSource.TMDB, LanguageSource.AniDB],
    DescriptionLanguageOrder: ['en'],
    DescriptionSourceOrder: [LanguageSource.TMDB, LanguageSource.AniDB],
  },
  TraktTv: {
    Enabled: false,
    TokenExpirationDate: '',
    SyncFrequency: 1,
    AuthToken: '',
    RefreshToken: '',
  },
  Plex: {
    Server: '',
    Libraries: [],
    Token: '',
  },
  LogRotator: {
    Enabled: false,
    Zip: false,
    Delete: false,
    Delete_Days: '0',
  },
  AutoGroupSeries: false,
  AutoGroupSeriesUseScoreAlgorithm: false,
  AutoGroupSeriesRelationExclusions: [],
  Import: {
    AutomaticallyDeleteDuplicatesOnImport: false,
    RunOnStart: false,
    UseExistingFileWatchedStatus: false,
    VideoExtensions: [],
  },
  LoadImageMetadata: false,
  TraceLog: false,
  Plugins: {
    EnabledPlugins: {},
    Priority: [],
    Renamer: {
      EnabledRenamers: {},
      MoveOnImport: false,
      RenameOnImport: false,
      AllowRelocationInsideDestinationOnImport: true,
      DefaultRenamer: null,
    },
  },
};

export const transformSettings = (response: SettingsServerType) => {
  let webuiSettings = JSON.parse(
    response.WebUI_Settings === '' ? '{}' : response.WebUI_Settings,
  ) as WebUISettingsType;

  // Settings aren't fetched yet, transform is running on initialData
  // Return without any operatations
  if (webuiSettings.settingsRevision === 0) {
    return { ...response, WebUI_Settings: webuiSettings };
  }

  const currentSettingsRevision = webuiSettings.settingsRevision ?? 0;
  const versionedInitialSettings: WebUISettingsType = {
    ...initialSettings.WebUI_Settings,
    settingsRevision: Number(Object.keys(webuiSettingsPatches).pop()),
  };

  if (currentSettingsRevision < 4) {
    webuiSettings = versionedInitialSettings;
  } else {
    try {
      Object
        .keys(webuiSettingsPatches)
        .map(Number)
        .filter(key => key > currentSettingsRevision)
        .forEach((key) => {
          webuiSettings = webuiSettingsPatches[key](webuiSettings);
        });
      webuiSettings = merge({}, initialSettings.WebUI_Settings, webuiSettings);
    } catch {
      webuiSettings = versionedInitialSettings;
    }
  }
  return { ...response, WebUI_Settings: webuiSettings } as SettingsType;
  // For Dev Only
  // return { ...response, WebUI_Settings: initialSettings.WebUI_Settings } as SettingsType;
};

export const transformSupportedLanguages = (response: SupportedLanguagesResponseType): Record<string, string> => {
  const languages = response.reduce(
    (result, language) => (
      {
        ...result,
        [language.Alpha2]: `${language.Name} (${language.Alpha2})`,
      }
    ),
    {} as Record<string, string>,
  );

  const mainLanguage = languages['x-main'];
  delete languages['x-main'];

  return {
    'x-main': mainLanguage,
    ...languages,
  };
};
