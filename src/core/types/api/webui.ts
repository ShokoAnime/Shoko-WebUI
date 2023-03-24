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
  Ranges: WebuiSeriesFileSummaryRangeType[];
  MissingEpisodes: WebuiSeriesFileSummaryMissingEpisodeType[];
};

export type WebuiSeriesFileSummaryRangeType = {
  GroupName: string;
  Version: number;
  Source: string;
  BitDepth: number;
  Resolution: string;
  Width: number;
  Height: number;
  VideoCodecs: string;
  AudioCodecs: string;
  AudioLanguage: string;
  SubtitleCodecs: string;
  SubtitleLanguage: string;
  Location: string;
  RangeByType: {
    Unknown: {
      Range: string;
      FileSize: number;
    },
    Other: {
      Range: string;
      FileSize: number;
    },
    Normal: {
      Range: string;
      FileSize: number;
    },
    Special: {
      Range: string;
      FileSize: number;
    },
    Trailer: {
      Range: string;
      FileSize: number;
    },
    ThemeSong: {
      Range: string;
      FileSize: number;
    },
    OpeningSong: {
      Range: string;
      FileSize: number;
    },
    EndingSong: {
      Range: string;
      FileSize: number;
    },
    Parody: {
      Range: string;
      FileSize: number;
    },
    Interview: {
      Range: string;
      FileSize: number;
    },
    Extra: {
      Range: string;
      FileSize: number;
    }
  }
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