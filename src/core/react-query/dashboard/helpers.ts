import type { DashboardSeriesSummaryType } from '@/core/types/api/dashboard';

export const transformSeriesSummary = (response: DashboardSeriesSummaryType) => {
  const result = response;
  result.Other += (result?.Special ?? 0) + (result?.None ?? 0);
  delete result.Special;
  delete result.None;
  return result;
};
