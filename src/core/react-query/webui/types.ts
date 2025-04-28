export type GroupViewRequestType = {
  GroupIDs: number[];
  TagFilter: number;
  TagLimit: number;
  OrderByName?: boolean;
};

export type SeriesFileSummaryRequestType = {
  groupBy?: string;
  includeEpisodeDetails?: boolean;
  includeLocationDetails?: boolean;
};

export type WebuiUpdateCheckRequestType = {
  channel: 'Stable' | 'Dev';
  force: boolean;
};
