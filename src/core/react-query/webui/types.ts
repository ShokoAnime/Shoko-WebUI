export type GroupViewRequestType = {
  GroupIDs: number[];
  TagFilter: number;
  TagLimit: number;
  OrderByName?: boolean;
};

export type SeriesFileSummaryRequestType = {
  groupBy?: string;
};

export type WebuiUpdateCheckRequestType = {
  channel: 'Stable' | 'Dev';
  force: boolean;
};
