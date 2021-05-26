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
  Watched?: string;
  ResumePosition?: number;
  RoundedStandardResolution: string;
  Created: string;
};

export type FileDetailedType = FileType & {
  SeriesIDs: Array<{
    SeriesID: FileIDsType;
    EpisodeIDs: Array<FileIDsType>;
  }>;
};

type FileIDsType = {
  AniDB: number;
  TvDB: Array<number>;
  ID: number;
};

export type RecentFileDetailsType = {
  SeriesName: string;
  EpisodeNumber: number;
  EpisodeName: string;
  EpisodeType: string;
  Source: string;
  AudioLanguages: Array<string>;
  SubtitleLanguages: Array<string>;
  ReleaseGroup: string;
  VideoCodec: string;
};
