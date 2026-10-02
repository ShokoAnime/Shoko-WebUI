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
  FetchMode: number;
};

export type SettingsAnidbUpdateType = {
  Notification_HandleMovedFiles: boolean;
};

/** Which images to download for a metadata source, per image type. A max of `0` is no limit. */
export type SettingsMetadataImageType = {
  /** Image language preference order. `none` is an image without text, `x-main` the entry's own language. */
  ImageLanguageOrder: string[];
  AutoDownloadBackdrops: boolean;
  MaxAutoBackdrops: number;
  AutoDownloadPosters: boolean;
  MaxAutoPosters: number;
  AutoDownloadLogos: boolean;
  MaxAutoLogos: number;
  AutoDownloadBanners: boolean;
  MaxAutoBanners: number;
  AutoDownloadThumbnails: boolean;
  MaxAutoThumbnails: number;
  AutoDownloadStaffImages: boolean;
  MaxAutoStaffImages: number;
  AutoDownloadStudioImages: boolean;
};

/** The image settings of one source, TMDB or a plugin source, in place of the defaults. */
export type SettingsMetadataSourceImageType = SettingsMetadataImageType & {
  Source: string;
};

export type SettingsImageType = {
  /** Which images to download for a source without settings of its own. */
  MetadataSourceDefaults: SettingsMetadataImageType;
  MetadataSources: SettingsMetadataSourceImageType[];
};

export type SettingsMetadataType = {
  /** Days a creator, character, studio or network may go unused before it is purged. */
  PurgeOrphanedAfterDays: number;
  /** Days a series, movie or collection may stay stored with nothing linking to it, or `0` to keep them. */
  AutoPurgeUnlinkedAfterDays: number;
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
  Image: SettingsImageType;
  Metadata: SettingsMetadataType;
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
