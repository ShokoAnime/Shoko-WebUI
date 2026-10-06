import { describe, expect, it } from 'vitest';

import { getSeasonIndex, seasonKeyToValue, shiftSeason } from '@/core/utilities/season';
import {
  getBrowserCloseScroll,
  getBrowserOpenPin,
  getSeasonBrowserCloseAction,
  getSeasonSlides,
  getSeasonStrip,
  getSlideBounds,
  isBrowserYearInView,
  seasonBrowserEntryState,
} from '@/core/utilities/seasonSlider';

import type { SeasonSummaryType, SeasonYearType } from '@/core/types/api/airing-season';
import type { SeasonKey, YearlySeasonValues } from '@/core/utilities/season';

const summary = (year: number, season: YearlySeasonValues, count: number, isCurrent = false): SeasonSummaryType => ({
  key: { year, season },
  count,
  isCurrent,
  poster: null,
  backdrop: null,
});

// Newest first, as the server sends them: 2025 has no anime at all, and 2027 lists only the season after the current.
const years: SeasonYearType[] = [
  { year: 2027, seasons: [summary(2027, 'Winter', 3)] },
  { year: 2026, seasons: [summary(2026, 'Spring', 5), summary(2026, 'Fall', 7, true)] },
  { year: 2024, seasons: [summary(2024, 'Summer', 2)] },
];

const fall2026: SeasonKey = { year: 2026, season: 'Fall' };

describe('getSeasonStrip', () => {
  it('runs from the oldest year\'s winter to the last listed season, filling the gaps with empty seasons', () => {
    const strip = getSeasonStrip(years, fall2026);
    expect(strip.map(item => seasonKeyToValue(item.key))).toEqual([
      '2024-Winter',
      '2024-Spring',
      '2024-Summer',
      '2024-Fall',
      '2025-Winter',
      '2025-Spring',
      '2025-Summer',
      '2025-Fall',
      '2026-Winter',
      '2026-Spring',
      '2026-Summer',
      '2026-Fall',
      '2027-Winter',
    ]);
    expect(strip.map(item => item.count)).toEqual([0, 0, 2, 0, 0, 0, 0, 0, 0, 5, 0, 7, 3]);
    expect(strip.filter(item => item.isCurrent).map(item => seasonKeyToValue(item.key))).toEqual(['2026-Fall']);
  });

  it('reaches the local current season when its year is not listed', () => {
    const strip = getSeasonStrip([{ year: 2024, seasons: [summary(2024, 'Summer', 2)] }], fall2026);
    expect(seasonKeyToValue(strip.at(-1)!.key)).toBe('2026-Fall');
    expect(strip.at(-1)!.isCurrent).toBe(true);
  });

  it('is empty without years', () => {
    expect(getSeasonStrip([], fall2026)).toEqual([]);
  });
});

describe('getSeasonSlides', () => {
  const strip = getSeasonStrip(years, fall2026);
  const index = (key: SeasonKey) => getSeasonIndex(key);

  it('stretches the bounds to a selected season outside the strip', () => {
    const selected: SeasonKey = { year: 2028, season: 'Spring' };
    expect(getSlideBounds(strip, fall2026)).toEqual({ first: index(strip[0].key), last: index(strip.at(-1)!.key) });
    expect(getSlideBounds(strip, selected)).toEqual({ first: index(strip[0].key), last: index(selected) });
    expect(getSlideBounds([], selected)).toBeNull();
  });

  it('marks the seasons past the strip as unannounced and those before it as uncounted', () => {
    const after = getSeasonSlides(
      strip,
      index({ year: 2027, season: 'Winter' }),
      index({ year: 2027, season: 'Spring' }),
      fall2026,
    );
    expect(after.map(item => [item.count, item.isAnnounced])).toEqual([[3, true], [undefined, false]]);
    const before = getSeasonSlides(
      strip,
      index({ year: 2023, season: 'Fall' }),
      index({ year: 2024, season: 'Winter' }),
      fall2026,
    );
    expect(before.map(item => [item.count, item.isAnnounced])).toEqual([[undefined, true], [0, true]]);
  });

  it('falls back to uncounted seasons with the local current one without a strip', () => {
    const slides = getSeasonSlides(
      [],
      index({ year: 2026, season: 'Summer' }),
      index({ year: 2027, season: 'Winter' }),
      fall2026,
    );
    expect(slides.map(item => seasonKeyToValue(item.key))).toEqual(['2026-Summer', '2026-Fall', '2027-Winter']);
    expect(slides.map(item => [item.count, item.isCurrent, item.isAnnounced])).toEqual([
      [undefined, false, true],
      [undefined, true, true],
      [undefined, false, true],
    ]);
  });
});

describe('getSeasonBrowserCloseAction', () => {
  it('steps back only over the entry that opening the browser pushed', () => {
    expect(getSeasonBrowserCloseAction(seasonBrowserEntryState)).toBe('back');
    expect(getSeasonBrowserCloseAction(null)).toBe('replace');
    expect(getSeasonBrowserCloseAction({ firstRun: true })).toBe('replace');
  });
});

describe('getBrowserCloseScroll', () => {
  const opened = { season: '2026-Fall', top: 1500 };
  const stickTop = 300;

  it('returns to where the page was while the season shown at opening is shown again', () => {
    expect(getBrowserCloseScroll(opened, fall2026, 4000, stickTop)).toEqual({ top: 1500, restore: true });
    // Changed with the slider, then back before closing.
    const andBack = shiftSeason(shiftSeason(fall2026, -1), 1);
    expect(getBrowserCloseScroll(opened, andBack, 4000, stickTop)).toEqual({ top: 1500, restore: true });
  });

  it('goes up to where the slider sticks for another season, when scrolled past it', () => {
    // Picked in the browser, or changed with the slider before closing.
    const other: SeasonKey = { year: 2024, season: 'Summer' };
    expect(getBrowserCloseScroll(opened, other, 4000, stickTop)).toEqual({ top: stickTop, restore: false });
    expect(getBrowserCloseScroll(opened, shiftSeason(fall2026, -1), 4000, stickTop)).toEqual({
      top: stickTop,
      restore: false,
    });
    expect(getBrowserCloseScroll(opened, other, 100, stickTop)).toBeNull();
  });

  it('goes to where the slider sticks after a pick of another season, even from above it', () => {
    const other: SeasonKey = { year: 2024, season: 'Summer' };
    expect(getBrowserCloseScroll(opened, other, 100, stickTop, true)).toEqual({ top: stickTop, restore: false });
    expect(getBrowserCloseScroll(null, other, 0, stickTop, true)).toEqual({ top: stickTop, restore: false });
    expect(getBrowserCloseScroll(opened, fall2026, 100, stickTop, true)).toEqual({ top: 1500, restore: true });
  });
});

describe('getBrowserOpenPin', () => {
  it('keeps the slider stuck by going up to where it sticks, when scrolled past it', () => {
    expect(getBrowserOpenPin(3000, 281)).toBe(281);
    expect(getBrowserOpenPin(282, 281)).toBe(281);
  });

  it('leaves the scroll as it is above the stick point', () => {
    expect(getBrowserOpenPin(281, 281)).toBeNull();
    expect(getBrowserOpenPin(0, 281)).toBeNull();
  });
});

describe('isBrowserYearInView', () => {
  // Pinned at the stick point, under a 72px slider bar, in a 900px view.
  const scrollTop = 281;
  const inset = 72;
  const viewHeight = 900;

  it('takes a year with any of it below the slider bar as in view', () => {
    expect(isBrowserYearInView({ start: 629, end: 869 }, scrollTop, inset, viewHeight)).toBe(true);
    // Mostly under the bar, or mostly below the view.
    expect(isBrowserYearInView({ start: 200, end: 360 }, scrollTop, inset, viewHeight)).toBe(true);
    expect(isBrowserYearInView({ start: 1100, end: 1400 }, scrollTop, inset, viewHeight)).toBe(true);
  });

  it('takes a year wholly under the slider bar or below the view as out of view', () => {
    expect(isBrowserYearInView({ start: 100, end: 353 }, scrollTop, inset, viewHeight)).toBe(false);
    expect(isBrowserYearInView({ start: 1181, end: 1421 }, scrollTop, inset, viewHeight)).toBe(false);
    expect(isBrowserYearInView({ start: 5500, end: 5740 }, scrollTop, inset, viewHeight)).toBe(false);
  });
});
