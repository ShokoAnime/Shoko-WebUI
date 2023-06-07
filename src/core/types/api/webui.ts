import { ImageType, RatingType } from './common';
import { CollectionFilterType } from './collection';
import { SeriesTitleType } from './series';

export type WebuiGroupExtraTag = {
  ID: number;
  Name: string;
  Weight: number;
  Source: 'AniDB' | 'User';
};

export type WebuiGroupExtra = {
  ID: number;
  Type: string;
  Rating: RatingType;
  AirDate: string | null;
  EndDate: string | null;
  Tags: Array<WebuiGroupExtraTag>;
};

export type WebuiSeriesRolePerson = {
  Name:	string;
  AlternateName: string | null;
  Description: string | null;
  Image: ImageType;
};

export type WebuiSeriesDetailsType = {
  FirstAirSeason: CollectionFilterType;
  Studios: WebuiSeriesRolePerson[];
  Producers: WebuiSeriesRolePerson[];
  SourceMaterial: string | null;
};

export type WebuiSeriesFileSummaryType = {
  Groups: WebuiSeriesFileSummaryGroupType[];
  MissingEpisodes: WebuiSeriesFileSummaryMissingEpisodeType[];
};

export type WebuiSeriesFileSummaryGroupType = {
  GroupName: string;
  Version: number;
  Source: string;
  BitDepth: number;
  Resolution: string;
  Width: number;
  Height: number;
  VideoCodecs: string;
  AudioCodecs: string;
  AudioLanguages: string[];
  AudioCount: number;
  SubtitleCodecs: string;
  SubtitleLanguages: string[];
  SubtitleCount: number;
  Location: string;
  RangeByType: {
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
  }
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
  }
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
