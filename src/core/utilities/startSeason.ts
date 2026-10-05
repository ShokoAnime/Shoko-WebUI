// Type imports only, so the unit tests can load this module.
import type { StartSeasonImportSummaryType, StartSeasonType } from '@/core/types/api/airing-season';
import type { SeasonKey } from '@/core/utilities/season';

/** The years the server takes for a start season. */
export const startSeasonYearRange = { min: 1900, max: 9999 };

export const isValidStartSeasonYear = (year: number) =>
  Number.isInteger(year) && year >= startSeasonYearRange.min && year <= startSeasonYearRange.max;

/** The season the move picker opens on: the anime's start season, else the fallback (the season being viewed). */
export const getStartSeasonKey = (
  startSeason: StartSeasonType | undefined,
  fallback: SeasonKey,
): SeasonKey => (startSeason?.Year && startSeason.Season
  ? { year: startSeason.Year, season: startSeason.Season }
  : fallback);

/** One line for an import's report, eg. `2 added, 1 updated, 1 rejected`; the zero counts are left out. */
export const formatStartSeasonImport = (summary: StartSeasonImportSummaryType) => {
  const parts = [
    [summary.Added, 'added'],
    [summary.Updated, 'updated'],
    [summary.Unchanged, 'unchanged'],
    [summary.Rejected.length, 'rejected'],
  ] as const;
  const text = parts.filter(([count]) => count > 0).map(([count, label]) => `${count} ${label}`).join(', ');
  return text || 'Nothing to import';
};
