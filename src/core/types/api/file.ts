import { SeriesIDsType } from './series';
import { EpisodeIDsType } from './episode';

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
  SeriesIDs?: XRefsType;
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

export type FileLinkApiType = {
  fileIDs: Array<number>;
  episodeID: number;
};
