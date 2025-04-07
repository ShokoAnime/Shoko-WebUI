import type { DataSourceType } from './common';
import type { EpisodeIDsType } from './episode';
import type { SeriesIDsType } from './series';
import type { PaginationType } from '@/core/types/api';

type XRefsType = {
  SeriesID: SeriesIDsType;
  EpisodeIDs: EpisodeIDsType[];
};

type FileTypeLocation = {
  ID: number;
  FileID: number;
  ManagedFolderID: number;
  RelativePath: string;
  AbsolutePath?: string;
  IsAccessible: boolean;
};

export type FileType = {
  ID: number;
  Size: number;
  Hashes: FileHashDigestType[];
  Locations: FileTypeLocation[];
  Duration: string;
  ResumePosition: string | null;
  Watched: string | null;
  Resolution: string;
  Created: string;
  Updated: string;
  IsVariation: boolean;
  SeriesIDs?: XRefsType[];
  Release?: ReleaseInfoType;
  MediaInfo?: FileMediaInfoType;
  AVDump: FileAVDumpType;
};

export type ReleaseInfoType = {
  ID: string | null;
  ProviderName: string;
  ReleaseURI: string | null;
  Revision: number;
  FileSize: number | null;
  Comment: string | null;
  OriginalFilename: string | null;
  IsCensored: boolean | null;
  IsCreditless: boolean | null;
  IsChaptered: boolean | null;
  IsCorrupted: boolean;
  Source: ReleaseSource;
  Group: ReleaseGroupType | null;
  Hashes: FileHashDigestType[] | null;
  MediaInfo: ReleaseMediaInfoType | null;
  CrossReferences: ReleaseCrossReferenceType[];
  Metadata: string | null;
  Released: string | null;
  Updated: string;
  Created: string;
};

export enum ReleaseSource {
  Unknown = 'Unknown',
  Other = 'Other',
  TV = 'TV',
  DVD = 'DVD',
  BluRay = 'BluRay',
  Web = 'Web',
  VHS = 'VHS',
  VCD = 'VCD',
  LaserDisc = 'LaserDisc',
  Camera = 'Camera',
}

export type ReleaseGroupType = {
  ID: string;
  Name: string;
  ShortName: string;
  Source: string;
};

export type ReleaseCrossReferenceType = {
  AnidbEpisodeID: number;
  AnidbAnimeID: number | null;
  PercentageStart: number;
  PercentageEnd: number;
};

export type ReleaseMediaInfoType = {
  AudioLanguages: string[];
  SubtitleLanguages: string[];
};

export type FileHashDigestType = {
  Type: string;
  Value: string;
  Metadata?: string;
};

export type FileAVDumpType = {
  Status: 'Queued' | null;
  LastDumpedAt: string | null;
  LastVersion: string | null;
} | {
  Status: 'Running';
  Progress: number;
  SucceededCreqCount: number;
  FailedCreqCount: number;
  PendingCreqCount: number;
  StartedAt: string;
  LastDumpedAt: string | null;
  LastVersion: string | null;
};

export type FileAniDBReleaseGroupType = {
  ID: number;
  Name: string;
  ShortName: string;
};

type FileDetailedTypeSeriesID = {
  SeriesID: FileIDsType;
  EpisodeIDs: FileIDsType[];
};

export type FileDetailedType = FileType & {
  SeriesIDs: FileDetailedTypeSeriesID[];
};

export type FileIDsType = {
  AniDB: number;
  ID: number;
};

export const enum FileSourceEnum {
  Unknown = 'Unknown',
  Other = 'Other',
  TV = 'TV',
  DVD = 'DVD',
  BluRay = 'BluRay',
  Web = 'Web',
  VHS = 'VHS',
  VCD = 'VCD',
  LaserDisc = 'LaserDisc',
  Camera = 'Camera',
}

export type FileMediaInfoType = {
  Title: string;
  Duration: string;
  BitRate: number;
  FrameRate: number;
  Encoded: string;
  IsStreamable: boolean;
  FileExtension: string;
  MediaContainer: string;
  MediaContainerVersion: number;
  Video: FileMediaInfoVideoType[];
  Audio: FileMediaInfoAudioType[];
  Subtitles: FileMediaInfoSubtitlesType[];
  Chapters: FileMediaInfoChapterType[];
};

export type FileMediaInfoVideoType = {
  Width: number;
  Height: number;
  Resolution: string;
  PixelAspectRatio: number;
  FrameRate: number;
  FrameRateMode: string;
  FrameCount: number;
  ScanType: string;
  ColorSpace: string;
  ChromaSubsampling: string;
  BitRate: number;
  BitDepth: number;
  ID: number;
  UID: string;
  Order: number;
  IsDefault: boolean;
  IsForced: boolean;
  Language: string;
  LanguageCode: string;
  Codec: {
    Simplified: string;
    Raw: string;
  };
  Format: {
    Name: string;
    Profile: string;
    Level: string;
    CABAC: boolean;
    BVOP: boolean;
    QPel: boolean;
    ReferenceFrames: number;
  };
};

export type FileMediaInfoAudioType = {
  Channels: number;
  ChannelLayout: string;
  SamplesPerFrame: number;
  SamplingRate: number;
  CompressionMode: string;
  BitRate: number;
  BitRateMode: string | null;
  BitDepth: number;
  ID: number;
  UID: string;
  Title: string;
  Order: number;
  IsDefault: boolean;
  IsForced: boolean;
  Language: string;
  LanguageCode: string;
  Codec: {
    Simplified: string;
    Raw: string;
  };
  Format: {
    Name: string;
    AdditionalFeatures: string;
  };
};

export type FileMediaInfoSubtitlesType = {
  SubTitle: string | null;
  IsExternal: boolean;
  ID: number;
  UID: string;
  Title: string;
  Order: number;
  IsDefault: boolean;
  IsForced: boolean;
  Language: string;
  LanguageCode: string;
  Codec: {
    Simplified: string;
    Raw: string;
  };
  Format: {
    Name: string;
  };
};

export type FileMediaInfoChapterType = {
  Title: string;
  Timestamp: string;
};

export enum FileSortCriteriaEnum {
  None = 0,
  ManagedFolderName = 1,
  ManagedFolderID = 2,
  AbsolutePath = 3,
  RelativePath = 4,
  FileSize = 5,
  DuplicateCount = 6,
  CreatedAt = 7,
  ImportedAt = 8,
  ViewedAt = 9,
  WatchedAt = 10,
  ED2K = 11,
  MD5 = 12,
  SHA1 = 13,
  CRC32 = 14,
  FileName = 15,
  FileID = 16,
}

type SeriesEpisodesQueryBaseType = {
  includeMissing?: string;
  includeHidden?: string;
  includeWatched?: string;
  type?: string;
  search?: string;
  fuzzy?: boolean;
};

export type SeriesEpisodesQueryType =
  & SeriesEpisodesQueryBaseType
  & { includeDataFrom?: DataSourceType[] }
  & PaginationType;
