import type { Layout } from 'react-grid-layout';

import type { DataSourceValues } from './common';
import type { ReleaseChannelValues } from '@/core/types/api/init';
import type { ManualLinkProviderType } from '@/core/types/utilities/link-files-with-providers';

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
  DownloadRelatedAnime: boolean;
  MaxRelationDepth: number;
};

export type MyListDeleteType =
  | 'Delete'
  | 'DeleteLocalOnly'
  | 'MarkDeleted'
  | 'MarkExternalStorage'
  | 'MarkUnknown'
  | 'MarkDisk';

export type MyListStorageState = 'Unknown' | 'HDD' | 'Disk' | 'Deleted' | 'Remote';

export type MyListWatchedEpisodeMode = 'Ignore' | 'AttachToOldest' | 'CreateGeneric';

export type MyListWatchedSyncMode = 'Ignore' | 'TrustLocal' | 'TrustRemote';

export type SettingsAnidbMyListType = {
  AddFiles: boolean;
  SyncTargets: number;
  WatchedEpisodeMode: MyListWatchedEpisodeMode;
  ReadWatched: boolean;
  ReadUnwatched: boolean;
  SetWatched: boolean;
  SetUnwatched: boolean;
  StorageState: MyListStorageState;
  UpdateStates: boolean;
  WatchedSyncMode: MyListWatchedSyncMode;
  DeleteType: MyListDeleteType;
  UseGenericFileIndex: boolean;
  RetainedBackupCount: number;
  UpdateFrequency: SettingsUpdateFrequencyType;
  FetchMode: number;
};

// Never = 1, HoursSix = 2, HoursTwelve = 3, Daily = 4, WeekOne = 5, MonthOne = 6
export type SettingsUpdateFrequencyType = 1 | 2 | 3 | 4 | 5 | 6;

export type SettingsAnidbUpdateType = {
  Calendar_UpdateFrequency: SettingsUpdateFrequencyType;
  Anime_UpdateFrequency: SettingsUpdateFrequencyType;
  File_UpdateFrequency: SettingsUpdateFrequencyType;
  Notification_UpdateFrequency: SettingsUpdateFrequencyType;
  Notification_HandleMovedFiles: boolean;
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
   * Image language preference order. Images in other languages are not
   * downloaded, unless the list is empty. `none` matches images without a
   * language, and `x-main` matches the main language of the TMDB entity.
   *
   * @default ['none', 'x-main', 'en']
   */
  ImageLanguageOrder: string[];

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

export type SettingsAnilistType = {
  /**
   * Automagically link AniDB anime to AniList anime.
   *
   * @default false
   */
  AutoLink: boolean;

  /**
   * Automagically link restricted AniDB anime to AniList anime.
   * {@link AutoLink} also needs to be set for this setting to take
   * effect.
   *
   * @default true
   */
  AutoLinkRestricted: boolean;

  /**
   * Consider existing links from other providers when auto-matching
   * episodes.
   *
   * @default false
   */
  ConsiderExistingOtherLinks: boolean;

  /**
   * Automagically download staff for AniList anime.
   *
   * @default false
   */
  AutoDownloadStaff: boolean;

  /**
   * Automagically download characters for AniList anime.
   *
   * @default false
   */
  AutoDownloadCharacters: boolean;

  /**
   * Optional. Image CDN base URL to use instead of the default AniList CDN.
   *
   * @default null
   */
  ImageCdnUrl: string | null;

  /**
   * Automagically download posters for AniList anime.
   *
   * @default true
   */
  AutoDownloadPosters: boolean;

  /**
   * Automagically download banners for AniList anime.
   *
   * @default true
   */
  AutoDownloadBanners: boolean;

  /**
   * Automagically download studios for AniList anime.
   *
   * @default false
   */
  AutoDownloadStudios: boolean;

  /**
   * The number of candidates to consider during an auto-search.
   *
   * @default 5
   */
  AutoSearchCandidateCount: number;

  /**
   * Purge unlinked AniList anime after the given number of days. Set to 0 to
   * disable.
   *
   * @default 14
   */
  AutoPurgeUnlinkedAfterDays: number;

  /**
   * AniList request rate limit.
   */
  RateLimit: SettingsAnilistRateLimitType;
};

export type SettingsAnilistRateLimitType = {
  /**
   * Maximum number of requests per window. Range 1-90.
   *
   * @default 1
   */
  MaxRequestsPerWindow: number;

  /**
   * Window duration in milliseconds. Range 1000-120000.
   *
   * @default 4000
   */
  WindowDurationMs: number;
};

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
   * @default ['AniDB', 'TMDB']
   */
  SeriesTitleSourceOrder: DataSourceValues[];

  /**
   * Episode / season title language preference order.
   *
   * @default ["en"]
   */
  EpisodeTitleLanguageOrder: string[];

  /**
   * Episode / season title source preference order.
   *
   * @default ['TMDB', 'AniDB']
   */
  EpisodeTitleSourceOrder: DataSourceValues[];

  /**
   * Description language preference order.
   *
   * @default ["en"]
   */
  DescriptionLanguageOrder: string[];

  /**
   * Description source preference order.
   *
   * @default ['TMDB', 'AniDB']
   */
  DescriptionSourceOrder: DataSourceValues[];
};

export type SettingsPlexType = {
  Libraries: number[];
  Token: string;
  Server: string;
};

export type SettingsLoggingType = {
  RotationEnabled: boolean;
  RotationCompress: boolean;
  RotationDeleteEnabled: boolean;
  RotationDeleteDays?: number;
  TraceLog: boolean;
};

export type SettingsImportType = {
  AutomaticallyDeleteDuplicatesOnImport: boolean;
  RunOnStart: boolean;
  UseExistingFileWatchedStatus: boolean;
  VideoExtensions: string[];
};

export type ReleaseSignalTypeValues =
  | 'Source'
  | 'Resolution'
  | 'VideoCodec'
  | 'BitDepth'
  | 'AudioCodec'
  | 'AudioLanguage'
  | 'AudioStreams'
  | 'SubtitleLanguage'
  | 'SubtitleStreams'
  | 'Version'
  | 'Chaptered'
  | 'Censored'
  | 'Creditless'
  | 'Corrupted'
  | 'GroupHomogeneity'
  | 'SubGroup';

export type ReleaseComparisonPreferencesType = {
  SignalPriority: ReleaseSignalTypeValues[];
  SourceOrder: string[];
  ResolutionOrder: string[];
  VideoCodecOrder: string[];
  AudioCodecOrder: string[];
  AudioLanguageOrder: string[];
  SubtitleLanguageOrder: string[];
  SubGroupOrder: string[];
  PreferHigherBitDepth: boolean;
  AllowDeletion: boolean;
  AutoDeleteOnImport: boolean;
  PerFileDeletionForAiringSeries: boolean;
  EpisodeTypeScope: 'KeepTogether' | 'BestPerType';
};

export type PluginRenamerSettingsType = {
  EnabledRenamers: Record<string, boolean>;
  MoveOnImport: boolean;
  RenameOnImport: boolean;
  AllowRelocationInsideDestinationOnImport: boolean;
  DefaultRenamer: string | null;
};

export type PluginUpdatesSettingsType = {
  IsAutoSyncEnabled: boolean;
  IsAutoUpgradeEnabled: boolean;
  AutoUpdateFrequency: SettingsUpdateFrequencyType;
  // .NET TimeSpan string, e.g. "12:00:00" or "30.00:00:00".
  DefaultRepositoryStaleTime: string;
  // .NET TimeSpan string, e.g. "12:00:00" or "30.00:00:00".
  InactivePluginVersionRetention: string;
};

export type PluginSettingsType = {
  EnabledPlugins: Record<string, boolean>;
  Priority: string[];
  Renamer: PluginRenamerSettingsType;
  Updates: PluginUpdatesSettingsType;
};

export type SettingsServerType = {
  WebUI_Settings: string;
  FirstRun: boolean;
  Database: SettingsDatabaseType;
  AniDb:
    & SettingsAnidbLoginType
    & SettingsAnidbType
    & SettingsAnidbDownloadType
    & SettingsAnidbUpdateType
    & { MyList: SettingsAnidbMyListType };
  TMDB: SettingsTMDBType;
  Anilist: SettingsAnilistType;
  Language: SettingsLanguageType;
  Plex: SettingsPlexType;
  Logging: SettingsLoggingType;
  AutoGroupSeries: boolean;
  AutoGroupSeriesUseScoreAlgorithm: boolean;
  AutoGroupSeriesRelationExclusions: string[];
  Import: SettingsImportType;
  ReleaseComparisonPreferences: ReleaseComparisonPreferencesType;
  LoadImageMetadata: boolean;
  Plugins: PluginSettingsType;
};

export type WebUISettingsType = {
  notifications: boolean;
  settingsRevision: number;
  theme: string;
  toastPosition: 'top-right' | 'bottom-right';
  updateChannel: ReleaseChannelValues;
  serverUpdateChannel: ReleaseChannelValues;
  layout: {
    dashboard: Partial<Record<string, Layout>>;
  };
  releaseInfoProviders: ManualLinkProviderType[];
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
    anilist: {
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
    hideManagedFolders: boolean;
    hideShokoNews: boolean;
    hideContinueWatching: boolean;
    hideNextUp: boolean;
    hideUpcomingAnime: boolean;
    hideRecommendedAnime: boolean;
    combineContinueWatching: boolean;
    useThumbnailsForEpisodes: boolean;
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
