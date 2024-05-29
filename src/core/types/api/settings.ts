export type SettingsDatabaseType = {
  MySqliteDirectory: string;
  DatabaseBackupDirectory: string;
  Type: 'SQLite' | 'MySQL' | 'SQLServer';
  Username: string;
  Password: string;
  Schema: string;
  Hostname: string;
  SQLite_DatabaseFile: string;
};

export type SettingsAnidbLoginType = {
  Username: string;
  Password: string;
};

export type SettingsAnidbType = {
  AVDumpKey: string;
  ClientPort: number;
  AVDumpClientPort: number;
  HTTPServerUrl: string;
  UDPServerAddress: string;
  UDPServerPort: number;
};

export type SettingsAnidbDownloadType = {
  DownloadCharacters: boolean;
  DownloadCreators: boolean;
  DownloadReleaseGroups: boolean;
  DownloadRelatedAnime: boolean;
  MaxRelationDepth: number;
};

// Delete, DeleteLocalOnly, MarkDeleted, MarkExternalStorage, MarkUnknown, MarkDisk
export type MyListDeleteType = 0 | 1 | 2 | 3 | 4 | 5;
// Unknown, HDD, Disk, Deleted, Remote
export type MyListStorageState = 0 | 1 | 2 | 3 | 4;

export type SettingsAnidbMylistType = {
  MyList_AddFiles: boolean;
  MyList_DeleteType: MyListDeleteType;
  MyList_ReadUnwatched: boolean;
  MyList_ReadWatched: boolean;
  MyList_SetUnwatched: boolean;
  MyList_SetWatched: boolean;
  MyList_StorageState: MyListStorageState;
};

// Never = 1, HoursSix = 2, HoursTwelve = 3, Daily = 4, WeekOne = 5, MonthOne = 6
export type SettingsUpdateFrequencyType = 1 | 2 | 3 | 4 | 5 | 6;

export type SettingsAnidbUpdateType = {
  Calendar_UpdateFrequency: SettingsUpdateFrequencyType;
  Anime_UpdateFrequency: SettingsUpdateFrequencyType;
  MyList_UpdateFrequency: SettingsUpdateFrequencyType;
  MyListStats_UpdateFrequency: SettingsUpdateFrequencyType;
  File_UpdateFrequency: SettingsUpdateFrequencyType;
};

export type SettingsTvdbDownloadType = {
  AutoFanart: boolean;
  AutoPosters: boolean;
  AutoWideBanners: boolean;
  AutoLink: boolean;
};

export type SettingsTvdbLanguageType =
  | 'zh'
  | 'en'
  | 'sv'
  | 'no'
  | 'da'
  | 'fi'
  | 'nl'
  | 'de'
  | 'it'
  | 'es'
  | 'fr'
  | 'pl'
  | 'hu'
  | 'el'
  | 'tr'
  | 'ru'
  | 'he'
  | 'ja'
  | 'pt'
  | 'cs'
  | 'sl'
  | 'hr'
  | 'ko';

export type SettingsTvdbPrefsType = {
  AutoFanartAmount: number;
  AutoPostersAmount: number;
  AutoWideBannersAmount: number;
  Language: SettingsTvdbLanguageType;
  UpdateFrequency: SettingsUpdateFrequencyType;
};

export type SettingsTraktType = {
  Enabled: boolean;
  TokenExpirationDate: string;
  UpdateFrequency: SettingsUpdateFrequencyType;
  SyncFrequency: SettingsUpdateFrequencyType;
  PIN: string;
  AuthToken: string;
  RefreshToken: string;
};

export type SettingsMoviedbType = {
  AutoFanart: boolean;
  AutoFanartAmount: number;
  AutoPosters: boolean;
  AutoPostersAmount: number;
};

export type SettingsPlexType = {
  Libraries: number[];
  Token: string;
  Server: string;
};

export type SettingsLogRotatorType = {
  Enabled: boolean;
  Zip: boolean;
  Delete: boolean;
  Delete_Days: string;
};

export type SettingsImportType = {
  AutomaticallyDeleteDuplicatesOnImport: boolean;
  MoveOnImport: boolean;
  RenameOnImport: boolean;
  RenameThenMove: boolean;
  RunOnStart: boolean;
  UseExistingFileWatchedStatus: boolean;
  VideoExtensions: string[];
};

export type SettingsServerType = {
  WebUI_Settings: string;
  FirstRun: boolean;
  Database: SettingsDatabaseType;
  AniDb:
    & SettingsAnidbLoginType
    & SettingsAnidbType
    & SettingsAnidbDownloadType
    & SettingsAnidbMylistType
    & SettingsAnidbUpdateType;
  TvDB: SettingsTvdbDownloadType & SettingsTvdbPrefsType;
  MovieDb: SettingsMoviedbType;
  TraktTv: SettingsTraktType;
  Plex: SettingsPlexType;
  LogRotator: SettingsLogRotatorType;
  GA_OptOutPlzDont: boolean;
  AutoGroupSeries: boolean;
  AutoGroupSeriesUseScoreAlgorithm: boolean;
  AutoGroupSeriesRelationExclusions: string[];
  LanguageUseSynonyms: boolean;
  LanguagePreference: string[];
  EpisodeLanguagePreference: string[];
  Import: SettingsImportType;
  TraceLog: boolean;
};

type LayoutItemType = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  moved?: boolean;
};

export type LayoutType = Record<string, LayoutItemType[]>;

export type WebUISettingsType = {
  notifications: boolean;
  settingsRevision: number;
  theme: string;
  toastPosition: 'top-right' | 'bottom-right';
  updateChannel: 'Stable' | 'Dev';
  layout: Record<string, LayoutType>;
  collection: {
    view: 'poster' | 'list';
    poster: {
      showEpisodeCount: boolean;
      showGroupIndicator: boolean;
      showUnwatchedCount: boolean;
    };
    list: {
      showItemType: boolean;
      showGroupIndicator: boolean;
      showTopTags: boolean;
      showCustomTags: boolean;
    };
    image: {
      showRandomPoster: boolean;
      showRandomFanart: boolean;
      useThumbnailFallback: boolean;
    };
  };
  dashboard: {
    hideQueueProcessor: boolean;
    hideUnrecognizedFiles: boolean;
    hideRecentlyImported: boolean;
    hideCollectionStats: boolean;
    hideMediaType: boolean;
    hideImportFolders: boolean;
    hideShokoNews: boolean;
    hideContinueWatching: boolean;
    hideNextUp: boolean;
    hideUpcomingAnime: boolean;
    hideRecommendedAnime: boolean;
    combineContinueWatching: boolean;
    hideR18Content: boolean;
    shokoNewsPostsCount: number;
    recentlyImportedEpisodesCount: number;
    recentlyImportedSeriesCount: number;
  };
};

export type SettingsType = Omit<SettingsServerType, 'WebUI_Settings'> & {
  WebUI_Settings: WebUISettingsType;
};
