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
    Accessible: boolean;
  }>;
  Duration: string;
  ResumePosition: string | null;
  Watched: string | null;
  RoundedStandardResolution: string;
  Created: string;
};

export type FileAniDBType = {
  ID: number;
  Source: string;
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
