import type { DashboardRequestType } from '@/core/react-query/types';
import type { EpisodeTypeValues } from '@/core/types/api/episode';

export type DashboardCalendarRequestType = {
  includeRestricted?: boolean;
  showAll?: boolean;
};

export type DashboardContinueWatchingRequestType = {
  includeSpecials?: boolean;
} & DashboardRequestType;

export type DashboardNextUpRequestType = {
  onlyUnwatched?: boolean;
} & DashboardRequestType;

export type DashboardCalendarEpisodesRequestType = {
  /** Inclusive start of the range, `YYYY-MM-DD`. */
  startDate: string;
  /** Inclusive end of the range, `YYYY-MM-DD`. */
  endDate: string;
  includeMissing?: 'True' | 'False' | 'Only';
  includeRestricted?: 'True' | 'False' | 'Only';
  /** `Only` keeps episodes with a known broadcast time, `False` those without, `True` (default) all. */
  includeWithAirTime?: 'True' | 'False' | 'Only';
  /** AniDB episode types to include. Omitted, the server defaults to `Episode` only. */
  type?: EpisodeTypeValues[];
};
