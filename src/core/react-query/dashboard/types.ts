import type { DashboardRequestType } from '@/core/react-query/types';

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
