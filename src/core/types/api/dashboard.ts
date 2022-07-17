import { ImageType } from './common';

export type DashboardSeriesSummaryType = {
  Series?: number,
  OVA?: number,
  Movie?: number,
  Special?: number,
  Web?: number,
  Other?: number,
  None?: number,
};

export type DashboardStatsType = {
  FileCount?: number,
  SeriesCount?: number,
  GroupCount?: number,
  FileSize?: number,
  FinishedSeries?: number,
  WatchedEpisodes?: number,
  WatchedHours?: number,
  PercentDuplicate?: number,
  MissingEpisodes?: number,
  MissingEpisodesCollecting?: number,
  UnrecognizedFiles?: number,
  SeriesWithMissingLinks?: number,
  EpisodesWithMultipleFiles?: number,
  FilesWithDuplicateLocations?: number,
};

export type DashboardEpisodeDetailsType = {
  IDs: {
    ID: number,
    Series: number,
    ShokoFile: number | null,
    ShokoEpisode: number | null,
    ShokoSeries: number | null,
  },
  Title: string,
  Number: number,
  Type: string,
  AirDate: string,
  Duration: string,
  ResumePosition: string | null,
  Watched: string | null,
  SeriesTitle: string,
  SeriesPoster: ImageType,
};

export type DashboardNewsType = {
  link: string,
  title: string,
  content_text: string;
  url: string;
  date_published: string;
};