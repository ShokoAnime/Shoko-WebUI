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
