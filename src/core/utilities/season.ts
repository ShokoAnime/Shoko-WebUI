// No imports: the helpers below only compute boundaries, and this module stays loadable by the unit tests.

/** One of the four anime seasons of a year. */
export type YearlySeasonValues = 'Winter' | 'Spring' | 'Summer' | 'Fall';

/** A year plus one of its four anime seasons, the pair the server's season filters are keyed by. */
export type SeasonKey = {
  year: number;
  season: YearlySeasonValues;
};

export const seasonOrder: YearlySeasonValues[] = ['Winter', 'Spring', 'Summer', 'Fall'];

// The day each season opens, mirroring the server's own `IsInSeason` boundaries
// (`Shoko.Server/Extensions/Models.cs`) so that "the current season" here is the season the server
// would put a premiere in. Winter opens in the *previous* calendar year, hence the year offset.
const seasonStarts: Record<YearlySeasonValues, { yearOffset: number, month: number, day: number }> = {
  Winter: { yearOffset: -1, month: 11, day: 25 },
  Spring: { yearOffset: 0, month: 2, day: 25 },
  Summer: { yearOffset: 0, month: 5, day: 24 },
  Fall: { yearOffset: 0, month: 8, day: 24 },
};

/**
 * Local midnight on the day the season opens. Plain `Date` arithmetic rather than dayjs: this module
 * only computes boundaries, and every time it hands back is formatted through dayjs by its callers.
 */
export const getSeasonStart = ({ season, year }: SeasonKey) => {
  const { day, month, yearOffset } = seasonStarts[season];
  return new Date(year + yearOffset, month, day);
};

export const seasonKeyToString = ({ season, year }: SeasonKey) => `${season} ${year}`;

/** A stable, parseable form for the WebUI's own URLs and form controls, eg. `2026-Summer`. */
export const seasonKeyToValue = ({ season, year }: SeasonKey) => `${year}-${season}`;

export const parseSeasonKey = (value: string): SeasonKey | undefined => {
  const [year, season] = value.split('-');
  const parsedYear = Number(year);
  if (!Number.isInteger(parsedYear) || !seasonOrder.includes(season as YearlySeasonValues)) return undefined;
  return { year: parsedYear, season: season as YearlySeasonValues };
};

export const isSameSeason = (left: SeasonKey, right: SeasonKey) =>
  left.year === right.year && left.season === right.season;

/** The season's place in time, counting seasons: later seasons have larger numbers. */
export const getSeasonIndex = ({ season, year }: SeasonKey) => year * 4 + seasonOrder.indexOf(season);

/** Steps `offset` seasons forward (or backward, when negative), rolling over the year. */
export const shiftSeason = ({ season, year }: SeasonKey, offset: number): SeasonKey => {
  const absolute = year * 4 + seasonOrder.indexOf(season) + offset;
  return { year: Math.floor(absolute / 4), season: seasonOrder[((absolute % 4) + 4) % 4] };
};

/**
 * The window the season occupies, from the day it opens to the day before the next one does.
 */
export const getSeasonRange = (key: SeasonKey) => {
  const nextStart = getSeasonStart(shiftSeason(key, 1));
  return {
    start: getSeasonStart(key),
    end: new Date(nextStart.getFullYear(), nextStart.getMonth(), nextStart.getDate() - 1),
  };
};

/** The season a given moment falls in, on the server's boundaries. */
export const getSeasonForDate = (date: Date): SeasonKey => {
  const candidates = [-1, 0, 1].flatMap(yearOffset =>
    seasonOrder.map(season => ({ year: date.getFullYear() + yearOffset, season }))
  );
  // The last season to have opened on or before the date is the one it sits in.
  return candidates
    .filter(key => getSeasonStart(key).getTime() <= date.getTime())
    .reduce((latest, key) => (getSeasonStart(key) > getSeasonStart(latest) ? key : latest));
};

export const getCurrentSeason = (now = new Date()) => getSeasonForDate(now);
