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
  ID: number,
  Title: string,
  Number: number,
  Type: string,
  AirDate: string,
  InCollection: boolean,
  SeriesID: number,
  SeriesTitle: string,
  SeriesPoster: {
    Source: string,
    Type: string,
    ID: string,
    RelativeFilepath: string,
    Preferred: boolean,
    Width: number,
    Height: number,
    Disabled: boolean,
  }
};
