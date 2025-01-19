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
  File_UpdateFrequency: SettingsUpdateFrequencyType;
  Notification_UpdateFrequency: SettingsUpdateFrequencyType;
  Notification_HandleMovedFiles: boolean;
};

export type SettingsTraktType = {
  Enabled: boolean;
  TokenExpirationDate: string;
  UpdateFrequency: SettingsUpdateFrequencyType;
  SyncFrequency: SettingsUpdateFrequencyType;
  AutoLink: boolean;
  AuthToken: string;
  RefreshToken: string;
};

export type SettingsTMDBType = {
  /**
   * Automagically link AniDB anime to TMDB shows and movies.
   *
   * @default false
   */
  AutoLink: boolean;

  /**
   * Automagically link restricted AniDB anime to TMDB shows and movies.
   * {@link AutoLink} also needs to be set for this setting to take
   * effect.
   *
   * @default false
   */
  AutoLinkRestricted: boolean;

  /**
   * Indicates that all titles should be stored locally for the TMDB entity,
   * otherwise it will use
   * {@link LanguageSettings.SeriesTitleLanguageOrder} or
   * {@link LanguageSettings.EpisodeTitleLanguageOrder} depending
   * on the entity type to determine which titles to store locally.
   *
   * @default false
   */
  DownloadAllTitles: boolean;

  /**
   * Indicates that all overviews should be stored locally for the TMDB
   * entity, otherwise it will use
   * {@link LanguageSettings.DescriptionLanguageOrder} to determine
   * which overviews should be stored locally.
   *
   * @default false
   */
  DownloadAllOverviews: boolean;

  /**
   * Automagically download crew and cast for movies and tv shows in the
   * local collection.
   *
   * @default false
   */
  AutoDownloadCrewAndCast: boolean;

  /**
   * Automagically download collections for movies and tv shows in the local
   * collection.
   *
   * @default false
   */
  AutoDownloadCollections: boolean;

  /**
   * Automagically download episode groups to use with alternate ordering
   * for tv shows.
   *
   * @default false
   */
  AutoDownloadAlternateOrdering: boolean;

  /**
   * Automagically download backdrops for TMDB entities that supports
   * backdrops up to {@link MaxAutoBackdrops} images per entity.
   *
   * @default true
   */
  AutoDownloadBackdrops: boolean;

  /**
   * The maximum number of backdrops to download for each TMDB entity that
   * supports backdrops.
   *
   * @remarks
   *
   * Set to `0` to disable the limit.
   *
   * @default 10
   * @min 0
   * @max 30
   */
  MaxAutoBackdrops: number;

  /**
   * Automagically download posters for TMDB entities that supports
   * posters up to {@link MaxAutoPosters} images per entity.
   *
   * @default true
   */
  AutoDownloadPosters: boolean;

  /**
   * The maximum number of posters to download for each TMDB entity that
   * supports posters.
   *
   * @remarks
   *
   * Set to `0` to disable the limit.
   *
   * @default 10
   * @min 0
   * @max 30
   */
  MaxAutoPosters: number;

  /**
   * Automagically download logos for TMDB entities that supports
   * logos up to {@link MaxAutoLogos} images per entity.
   * @default true
   */
  AutoDownloadLogos: boolean;

  /**
   * The maximum number of logos to download for each TMDB entity that
   * supports logos.
   *
   * @remarks
   *
   * Set to `0` to disable the limit.
   *
   * @default 10
   * @min 0
   * @max 30
   */
  MaxAutoLogos: number;

  /**
   * Automagically download thumbnail images for TMDB entities that supports
   * thumbnails.
   *
   * @default true
   */
  AutoDownloadThumbnails: boolean;

  /**
   * The maximum number of thumbnail images to download for each TMDB entity
   * that supports thumbnail images.
   *
   * @remarks
   *
   * Set to `0` to disable the limit.
   *
   * @default 10
   * @min 0
   * @max 30
   */
  MaxAutoThumbnails: number;

  /**
   * Automagically download staff member and voice-actor images.
   * @default true
   */
  AutoDownloadStaffImages: boolean;

  /**
   * The maximum number of staff member and voice-actor images to download
   * for each TMDB entity that supports staff member and voice-actor images.
   *
   * @remarks
   *
   * Set to `0` to disable the limit.
   *
   * @default 10
   * @min 0
   * @max 30
   */
  MaxAutoStaffImages: number;

  /**
   * Automagically download studio and company images.
   *
   * @default true
   */
  AutoDownloadStudioImages: boolean;

  /**
   * Optional. User provided TMDB API key to use.
   *
   * @default null
   */
  UserApiKey: string | null;
};

export const enum LanguageSource {
  AniDB = 'AniDB',
  TMDB = 'TMDB',
}

export type SettingsLanguageType = {
  /**
   * Use synonyms when selecting the preferred language from AniDB.
   *
   * @default false
   */
  UseSynonyms: boolean;

  /**
   * Series / group title language preference order.
   *
   * @default []
   */
  SeriesTitleLanguageOrder: string[];

  /**
   * Series / group title source preference order.
   *
   * @default [LanguageSource.AniDB, LanguageSource.TMDB]
   */
  SeriesTitleSourceOrder: LanguageSource[];

  /**
   * Episode / season title language preference order.
   *
   * @default ["en"]
   */
  EpisodeTitleLanguageOrder: string[];

  /**
   * Episode / season title source preference order.
   *
   * @default [LanguageSource.TMDB, LanguageSource.AniDB]
   */
  EpisodeTitleSourceOrder: LanguageSource[];

  /**
   * Description language preference order.
   *
   * @default ["en"]
   */
  DescriptionLanguageOrder: string[];

  /**
   * Description source preference order.
   *
   * @default [LanguageSource.TMDB, LanguageSource.AniDB]
   */
  DescriptionSourceOrder: LanguageSource[];
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
  RunOnStart: boolean;
  UseExistingFileWatchedStatus: boolean;
  VideoExtensions: string[];
};

export type PluginRenamerSettingsType = {
  EnabledRenamers: Record<string, boolean>;
  MoveOnImport: boolean;
  RenameOnImport: boolean;
  AllowRelocationInsideDestinationOnImport: boolean;
  DefaultRenamer: string | null;
};

export type PluginSettingsType = {
  EnabledPlugins: Record<string, boolean>;
  Priority: string[];
  Renamer: PluginRenamerSettingsType;
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
  TMDB: SettingsTMDBType;
  Language: SettingsLanguageType;
  TraktTv: SettingsTraktType;
  Plex: SettingsPlexType;
  LogRotator: SettingsLogRotatorType;
  AutoGroupSeries: boolean;
  AutoGroupSeriesUseScoreAlgorithm: boolean;
  AutoGroupSeriesRelationExclusions: string[];
  Import: SettingsImportType;
  LoadImageMetadata: boolean;
  TraceLog: boolean;
  Plugins: PluginSettingsType;
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
      showRandomBackdrop: boolean;
      useThumbnailFallback: boolean;
    };
    tmdb: {
      includeRestricted: boolean;
    };
    anidb: {
      filterDescription: boolean;
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
    recentlyImportedView: 'episodes' | 'series';
    upcomingAnimeView: 'collection' | 'all';
  };
};

export type SettingsType = Omit<SettingsServerType, 'WebUI_Settings'> & {
  WebUI_Settings: WebUISettingsType;
};
