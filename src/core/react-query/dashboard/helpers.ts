import type { DashboardSeriesSummaryType } from '@/core/types/api/dashboard';

export const transformSeriesSummary = (response: DashboardSeriesSummaryType) => {
  const result = response;
  result.Other += (result.Special ?? 0) + (result.None ?? 0) + (result.Unknown ?? 0) + (result.MusicVideo ?? 0);
  delete result.Special;
  delete result.None;
  delete result.MusicVideo;
  delete result.Unknown;
  return result;
};
