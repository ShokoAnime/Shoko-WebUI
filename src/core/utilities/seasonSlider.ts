import { getSeasonIndex, isSameSeason, seasonKeyToValue, seasonOrder, shiftSeason } from '@/core/utilities/season';

import type { SeasonYearType } from '@/core/types/api/airing-season';
import type { SeasonKey } from '@/core/utilities/season';

/** A season of the season view's slider. */
export type SeasonSlideType = {
  key: SeasonKey;
  /** How many anime the season has; `undefined` when the listed seasons do not cover it. */
  count?: number;
  isCurrent: boolean;
  /** Whether the season is past the last listed one, so still to be announced. */
  isAnnounced: boolean;
};

/**
 * The listed years as one strip of seasons, oldest first: from the oldest year's winter to the last listed season,
 * the current one included. The seasons the server leaves out, whole years among them, have no anime.
 */
export const getSeasonStrip = (years: SeasonYearType[], current: SeasonKey): SeasonSlideType[] => {
  const seasons = years.flatMap(item => item.seasons);
  if (seasons.length === 0) return [];

  // The server knows the current season; the local boundaries stand in when its year is not listed.
  const currentKey = seasons.find(item => item.isCurrent)?.key ?? current;
  const counts = new Map(seasons.map(item => [getSeasonIndex(item.key), item.count]));
  const firstYear = Math.min(...years.map(item => item.year));
  const first = getSeasonIndex({ year: firstYear, season: seasonOrder[0] });
  const last = Math.max(getSeasonIndex(currentKey), ...counts.keys());
  return Array.from({ length: last - first + 1 }, (_, offset) => {
    const index = first + offset;
    const key = shiftSeason({ year: firstYear, season: seasonOrder[0] }, offset);
    return { key, count: counts.get(index) ?? 0, isCurrent: isSameSeason(key, currentKey), isAnnounced: true };
  });
};

/**
 * The first and last season index the slider moves between: the strip's ends, stretched to take in a selected season
 * outside it. `null` while there is no strip, when the slider moves freely.
 */
export const getSlideBounds = (strip: SeasonSlideType[], selected: SeasonKey) => {
  if (strip.length === 0) return null;
  const selectedIndex = getSeasonIndex(selected);
  return {
    first: Math.min(getSeasonIndex(strip[0].key), selectedIndex),
    last: Math.max(getSeasonIndex(strip[strip.length - 1].key), selectedIndex),
  };
};

/**
 * The slides from one season index to another, both included. Those before the strip have no count, and those after
 * it are still to be announced; without a strip, every slide has no count and the local boundaries tell the current.
 */
export const getSeasonSlides = (
  strip: SeasonSlideType[],
  fromIndex: number,
  toIndex: number,
  current: SeasonKey,
): SeasonSlideType[] => {
  const first = strip.length > 0 ? getSeasonIndex(strip[0].key) : null;
  const last = first === null ? null : first + strip.length - 1;
  return Array.from({ length: Math.max(toIndex - fromIndex + 1, 0) }, (_, offset) => {
    const index = fromIndex + offset;
    if (first !== null && last !== null && index >= first && index <= last) return strip[index - first];
    const key = shiftSeason({ year: 0, season: seasonOrder[0] }, index);
    return {
      key,
      isCurrent: first === null && isSameSeason(key, current),
      isAnnounced: last === null || index <= last,
    };
  });
};

/** The state of the history entry that opening the season browser pushes. */
export const seasonBrowserEntryState = { openedSeasonBrowser: true } as const;

/**
 * How closing the season browser leaves the history: back over the entry its opening pushed, when that is the current
 * one, so no open entry is left behind; else in place without it, as for a page loaded with the browser open.
 */
export const getSeasonBrowserCloseAction = (entryState: unknown): 'back' | 'replace' => {
  const state = entryState as Partial<typeof seasonBrowserEntryState> | null;
  return state?.openedSeasonBrowser === true ? 'back' : 'replace';
};

/** The season shown when the season browser opened, as a season value, and how far the page was scrolled. */
export type BrowserOpenScrollType = { season: string, top: number };

/** The scroll kept on the state of the history entry the season browser opened from, if any. */
export const getBrowserOpenScroll = (entryState: unknown): BrowserOpenScrollType | null => {
  const scroll = (entryState as { airingScheduleScroll?: Partial<BrowserOpenScrollType> } | null)?.airingScheduleScroll;
  if (typeof scroll?.season !== 'string' || typeof scroll.top !== 'number') return null;
  return { season: scroll.season, top: scroll.top };
};

/**
 * Where closing the season browser scrolls the page: back to where it was when the browser opened, when the season then
 * shown is shown again; else to where the slider sticks, so the season's anime start just below it, after a pick or
 * when scrolled past it. `null` leaves the scroll as it is.
 */
export const getBrowserCloseScroll = (
  opened: BrowserOpenScrollType | null,
  season: SeasonKey,
  scrollTop: number,
  stickTop: number,
  isPick = false,
): { top: number, restore: boolean } | null => {
  if (opened?.season === seasonKeyToValue(season)) return { top: opened.top, restore: true };
  if (isPick || scrollTop > stickTop) return { top: stickTop, restore: false };
  return null;
};

/**
 * Where opening the season browser from the slider puts the page as the browser takes the anime's place: at the stick
 * point when scrolled past it, so the slider stays stuck and the browser starts just below it. `null` leaves the scroll.
 */
export const getBrowserOpenPin = (scrollTop: number, stickTop: number) => (scrollTop > stickTop ? stickTop : null);

/**
 * Whether any of a year of the season browser, from `start` to `end` down the page, is in view below the slider bar,
 * which covers `inset` at the top of the view. Opening the browser centres the shown season's year only when not.
 */
export const isBrowserYearInView = (
  year: { start: number, end: number },
  scrollTop: number,
  inset: number,
  viewHeight: number,
) => year.end > scrollTop + inset && year.start < scrollTop + viewHeight;
