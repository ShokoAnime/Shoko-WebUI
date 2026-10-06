import { describe, expect, it } from 'vitest';

import {
  getSeasonForDate,
  getSeasonRange,
  isSameSeason,
  parseSeasonKey,
  seasonKeyToString,
  seasonKeyToValue,
  shiftSeason,
} from '@/core/utilities/season';

import type { SeasonKey } from '@/core/utilities/season';

// The boundaries these tests pin are the server's own (`Shoko.Server/Extensions/Models.cs`): a
// season opens a week before its first calendar month, and Winter opens in the *previous* year.
// Built part by part so the dates are local, the way the boundaries themselves are.
const atDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
};

const iso = (date: Date) =>
  `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;

describe('getSeasonForDate', () => {
  it.each<[string, SeasonKey]>([
    ['2026-01-15', { year: 2026, season: 'Winter' }],
    ['2026-03-24', { year: 2026, season: 'Winter' }],
    ['2026-03-25', { year: 2026, season: 'Spring' }],
    ['2026-06-23', { year: 2026, season: 'Spring' }],
    ['2026-06-24', { year: 2026, season: 'Summer' }],
    ['2026-09-16', { year: 2026, season: 'Summer' }],
    ['2026-09-24', { year: 2026, season: 'Fall' }],
    ['2026-12-24', { year: 2026, season: 'Fall' }],
    // Late December already belongs to the next year's Winter.
    ['2026-12-25', { year: 2027, season: 'Winter' }],
    ['2027-01-02', { year: 2027, season: 'Winter' }],
  ])('puts %s in the right season', (date, expected) => {
    expect(getSeasonForDate(atDate(date))).toEqual(expected);
  });
});

describe('getSeasonRange', () => {
  it('runs a season from its own start up to the day before the next one', () => {
    const range = getSeasonRange({ year: 2026, season: 'Summer' });
    expect(iso(range.start)).toBe('2026-06-24');
    expect(iso(range.end)).toBe('2026-09-23');
  });

  it('starts Winter in the previous calendar year', () => {
    const range = getSeasonRange({ year: 2026, season: 'Winter' });
    expect(iso(range.start)).toBe('2025-12-25');
    expect(iso(range.end)).toBe('2026-03-24');
  });
});

describe('shiftSeason', () => {
  it('rolls forward over the year boundary', () => {
    expect(shiftSeason({ year: 2026, season: 'Fall' }, 1)).toEqual({ year: 2027, season: 'Winter' });
  });

  it('rolls backward over the year boundary', () => {
    expect(shiftSeason({ year: 2026, season: 'Winter' }, -1)).toEqual({ year: 2025, season: 'Fall' });
  });

  it('steps several seasons at once', () => {
    expect(shiftSeason({ year: 2026, season: 'Spring' }, 6)).toEqual({ year: 2027, season: 'Fall' });
    expect(shiftSeason({ year: 2026, season: 'Spring' }, -6)).toEqual({ year: 2024, season: 'Fall' });
  });

  it('is a no-op for an offset of zero', () => {
    expect(shiftSeason({ year: 2026, season: 'Summer' }, 0)).toEqual({ year: 2026, season: 'Summer' });
  });
});

describe('season keys', () => {
  it('round-trips through its form value', () => {
    const key: SeasonKey = { year: 1997, season: 'Fall' };
    expect(parseSeasonKey(seasonKeyToValue(key))).toEqual(key);
  });

  it('rejects anything that is not a season', () => {
    expect(parseSeasonKey('2026-Monsoon')).toBeUndefined();
    expect(parseSeasonKey('Summer')).toBeUndefined();
    expect(parseSeasonKey('')).toBeUndefined();
  });

  it('labels a season the way the server names it', () => {
    expect(seasonKeyToString({ year: 2026, season: 'Summer' })).toBe('Summer 2026');
  });

  it('compares both halves of the key', () => {
    expect(isSameSeason({ year: 2026, season: 'Fall' }, { year: 2026, season: 'Fall' })).toBe(true);
    expect(isSameSeason({ year: 2026, season: 'Fall' }, { year: 2025, season: 'Fall' })).toBe(false);
    expect(isSameSeason({ year: 2026, season: 'Fall' }, { year: 2026, season: 'Summer' })).toBe(false);
  });
});
