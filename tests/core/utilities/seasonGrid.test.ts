import { describe, expect, it } from 'vitest';

import { getGridColumnCount, getSeasonGridRows, getSkeletonRowCount } from '@/core/utilities/seasonGrid';

import type { SeasonAnimeType, SeasonSectionType } from '@/core/types/api/airing-season';

const section = (id: string, count: number): SeasonSectionType => ({
  ID: id,
  Title: id,
  Anime: Array.from({ length: count }, (_, index) => ({ ID: index + 1 }) as SeasonAnimeType),
});

describe('getGridColumnCount', () => {
  it('adds a column at each width reached, from one', () => {
    const thresholds = [896, 1344];
    expect(getGridColumnCount(320, thresholds)).toBe(1);
    expect(getGridColumnCount(895, thresholds)).toBe(1);
    expect(getGridColumnCount(896, thresholds)).toBe(2);
    expect(getGridColumnCount(1343, thresholds)).toBe(2);
    expect(getGridColumnCount(1344, thresholds)).toBe(3);
    expect(getGridColumnCount(4000, thresholds)).toBe(3);
  });
});

describe('getSkeletonRowCount', () => {
  it('fills the view and one row more, with at least five rows', () => {
    expect(getSkeletonRowCount(900, 272)).toBe(5);
    expect(getSkeletonRowCount(2160, 272)).toBe(9);
    expect(getSkeletonRowCount(0, 272)).toBe(5);
  });
});

describe('getSeasonGridRows', () => {
  it('lists each section\'s title, then its cards a row at a time, marking the section\'s last row', () => {
    const rows = getSeasonGridRows([section('TV', 5), section('Movie', 1)], 2);
    expect(rows.map(row => (row.type === 'title' ? row.key : [row.anime.length, row.isSectionEnd]))).toEqual([
      'title-TV',
      [2, false],
      [2, false],
      [1, true],
      'title-Movie',
      [1, true],
    ]);
  });
});
