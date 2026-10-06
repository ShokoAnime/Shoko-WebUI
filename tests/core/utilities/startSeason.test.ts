import { describe, expect, it } from 'vitest';

import { formatStartSeasonImport, getStartSeasonKey, isValidStartSeasonYear } from '@/core/utilities/startSeason';

import type { StartSeasonImportSummaryType } from '@/core/types/api/airing-season';

describe('isValidStartSeasonYear', () => {
  it.each([
    [1900, true],
    [2026, true],
    [9999, true],
    [1899, false],
    [10000, false],
    [2026.5, false],
    [Number.NaN, false],
  ])('%s is %s', (year, expected) => {
    expect(isValidStartSeasonYear(year)).toBe(expected);
  });
});

describe('getStartSeasonKey', () => {
  const fallback = { year: 2026, season: 'Fall' } as const;

  it('takes the start season', () => {
    const key = getStartSeasonKey(
      { Year: 2025, Season: 'Summer', IsOverridden: true, Computed: { Year: 2026, Season: 'Winter' } },
      fallback,
    );
    expect(key).toEqual({ year: 2025, season: 'Summer' });
  });

  it('falls back without one', () => {
    expect(getStartSeasonKey(undefined, fallback)).toEqual(fallback);
    expect(getStartSeasonKey({ Year: null, Season: null, IsOverridden: false, Computed: null }, fallback))
      .toEqual(fallback);
  });
});

describe('formatStartSeasonImport', () => {
  const summary = (counts: Partial<StartSeasonImportSummaryType>): StartSeasonImportSummaryType => ({
    Added: 0,
    Updated: 0,
    Unchanged: 0,
    Rejected: [],
    ...counts,
  });

  it('leaves out the zero counts', () => {
    const rejected = [{ Line: 3, Text: 'x', Reason: 'Bad year' }];
    expect(formatStartSeasonImport(summary({ Added: 2, Rejected: rejected }))).toBe('2 added, 1 rejected');
  });

  it('says when there was nothing', () => {
    expect(formatStartSeasonImport(summary({}))).toBe('Nothing to import');
  });
});
