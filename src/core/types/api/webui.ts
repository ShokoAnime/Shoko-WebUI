import type { ImageType, RatingType } from './common';
import type { EpisodeTypeEnum } from './episode';
import type { FileSourceEnum } from './file';
import type { SeriesTitleType } from './series';
import type { TagType } from './tags';

export type WebuiGroupExtra = {
  ID: number;
  Type: string;
  Rating: RatingType;
  AirDate: string | null;
  EndDate: string | null;
  Tags: TagType[];
};

export type WebuiSeriesRolePerson = {
  Name: string;
  AlternateName: string | null;
  Description: string | null;
  Image: ImageType;
};

export type WebuiSeriesDetailsType = {
  FirstAirSeason: string;
  Studios: WebuiSeriesRolePerson[];
  Producers: WebuiSeriesRolePerson[];
  SourceMaterial: string | null;
  RuntimeLength: string | null;
};

export type WebuiSeriesFileSummaryType = {
  Overview: WebuiSeriesFileSummaryOverview;
  Groups: WebuiSeriesFileSummaryGroupType[];
  MissingEpisodes: WebuiSeriesFileSummaryMissingEpisodeType[];
};

export type WebuiSeriesFileSummaryGroupType = {
  GroupName?: string;
  GroupNameShort?: string;
  FileVersion?: number;
  FileSource?: string;
  FileLocation?: string;
  FileIsDeprecated?: boolean;
  ImportFolder?: number;
  VideoCodecs?: string;
  VideoBitDepth?: number;
  VideoResolution?: string;
  VideoWidth?: number;
  VideoHeight?: number;
  AudioCodecs?: string;
  AudioLanguages?: string[];
  AudioStreamCount?: number;
  SubtitleCodecs?: string;
  SubtitleLanguages?: string[];
  SubtitleStreamCount?: number;
  VideoHasChapters?: boolean;
  RangeByType: WebuiSeriesFileSummaryGroupRangeByType;
  Episodes?: {
    ED2K: string;
    EpisodeID: number;
    FileID: number;
    Number: number;
    Size: number;
    Type: EpisodeTypeEnum;
  }[];
};

export type WebuiSeriesFileSummaryGroupRangeByType = {
  Other: WebuiSeriesFileSummaryRangeByType;
  Normal: WebuiSeriesFileSummaryRangeByType;
  Special: WebuiSeriesFileSummaryRangeByType;
  Trailer: WebuiSeriesFileSummaryRangeByType;
  ThemeSong: WebuiSeriesFileSummaryRangeByType;
  OpeningSong: WebuiSeriesFileSummaryRangeByType;
  EndingSong: WebuiSeriesFileSummaryRangeByType;
  Parody: WebuiSeriesFileSummaryRangeByType;
  Interview: WebuiSeriesFileSummaryRangeByType;
  Extra: WebuiSeriesFileSummaryRangeByType;
};

export type WebuiSeriesFileSummaryRangeByType = {
  Count: number;
  Range: string;
  FileSize: number;
};

export type WebuiSeriesFileSummaryMissingEpisodeType = {
  ID: number;
  Type: number;
  EpisodeNumber: number;
  AirDate: string;
  Titles: SeriesTitleType[];
  Description: string;
  Rating: {
    Value: number;
    MaxValue: number;
    Source: string;
    Votes: number;
    Type: string;
  };
};

export type WebuiSeriesFileSummaryOverview = {
  SourcesByType: WebuiSeriesFileSummarySourcesByType[];
  TotalFileSize: number;
  ReleaseGroups: string[];
};

export type WebuiSeriesFileSummarySourcesByType = {
  Type: EpisodeTypeEnum;
  Sources: WebuiSeriesFileSummarySourceCount[];
};

export type WebuiSeriesFileSummarySourceCount = {
  Type: FileSourceEnum;
  Count: number;
};

export type WebuiTheme = {
  ID: string;
  Name: string;
  Description: string | null;
  Author: string;
  Version: string;
  Tags: string[];
  URL: string | null;
};
