import { PaginationType } from '../api';
import { SeriesIDsType } from './series';
import { EpisodeIDsType } from './episode';
import { DataSourceType } from './common';

type XRefsType = Array<{
  SeriesID: SeriesIDsType;
  EpisodeIDs: EpisodeIDsType;
}>;

export type FileType = {
  ID: number;
  Size: number;
  Hashes: {
    ED2K: string;
    SHA1: string;
    CRC32: string;
    MD5: string;
  };
  Locations: Array<{
    ImportFolderID: number;
    RelativePath: string;
    IsAccessible: boolean;
  }>;
  Duration: string;
  ResumePosition: string | null;
  Watched: string | null;
  Resolution: string;
  Created: string;
  Updated: string;
  IsVariation: boolean;
  SeriesIDs?: XRefsType;
  AniDB?: FileAniDBType;
  MediaInfo?: FileMediaInfoType;
};

export type FileAniDBType = {
  ID: number;
  Source: FileSourceEnum;
  ReleaseGroup: FileAniDBReleaseGroupType;
  ReleaseDate: string | null;
  Version: number;
  IsDeprecated: boolean;
  IsCensored: boolean;
  OriginalFileName: string;
  FileSize: bigint;
  Duration: string;
  Resolution: string;
  Description: string;
  AudioCodecs: string[];
  AudioLanguages: string[];
  SubLanguages: string[];
  VideoCodec: string;
  Chaptered: boolean;
  Updated: string;
};

export type FileAniDBReleaseGroupType = {
  ID: number;
  Name: string;
  ShortName: string;
};

export type FileDetailedType = FileType & {
  SeriesIDs: Array<{
    SeriesID: FileIDsType;
    EpisodeIDs: Array<FileIDsType>;
  }>;
};

export type FileIDsType = {
  AniDB: number;
  TvDB: Array<number>;
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

export type AVDumpResultType = {
  FullOutput: string;
  Ed2k: string;
};

export type FileLinkOneApiType = {
  fileID: number;
  episodeIDs: Array<number>;
};

export type FileLinkManyApiType = {
  fileIDs: Array<number>;
  episodeID: number;
};

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
  }
  Format: {
    Name: string;
    Profile: string;
    Level: string;
    CABAC: boolean;
    BVOP: boolean;
    QPel: boolean;
    ReferenceFrames: number;
  }
};

export type FileMediaInfoAudioType = {
  Channels: number;
  ChannelLayout: string;
  SamplesPerFrame: number;
  SamplingRate: number;
  CompressionMode: string;
  BitRate: number;
  BitRateMode: string | null,
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
  },
  Format: {
    Name: string;
    AdditionalFeatures: string;
  }
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
  },
  Format: {
    Name: string;
  }
};

export type FileMediaInfoChapterType = {
  Title: string;
  Timestamp: string;
};

export enum FileSortCriteriaEnum {
  None = 0,
  ImportFolderName = 1,
  ImportFolderID = 2,
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

type FileIncludeType = 'false' | 'true' | 'only';

export type FileRequestType = {
  includeMissing?: FileIncludeType;
  includeIgnored?: FileIncludeType;
  includeVariations?: FileIncludeType;
  includeDuplicates?: FileIncludeType;
  includeUnrecognized?: FileIncludeType;
  includeLinked?: FileIncludeType;
  includeViewed?: FileIncludeType;
  includeWatched?: FileIncludeType;
  sortOrder?: FileSortCriteriaEnum[];
  includeDataFrom?: DataSourceType[];
  includeMediaInfo?: boolean;
  includeXRefs?: boolean;
  search?: string;
} & PaginationType;
