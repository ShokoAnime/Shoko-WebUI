import type { ReleaseChannelValues } from '@/core/types/api/init';

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

export type UpdateCheckRequestType = {
  channel: ReleaseChannelValues;
  force: boolean;
};
