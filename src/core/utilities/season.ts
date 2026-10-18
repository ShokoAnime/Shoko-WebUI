import { maxBy, minBy } from 'lodash';

import type { SeasonSummaryType } from '@/core/react-query/airing-schedule/types';
import type { SeasonKey, YearlySeasonValues } from '@/core/types/api/airing-season';

export const seasonOrder: YearlySeasonValues[] = ['Winter', 'Spring', 'Summer', 'Fall'];

const seasonValuePattern = new RegExp(`^([1-9]\\d{3})-(${seasonOrder.join('|')})$`);

export const seasonKeyToString = ({ season, year }: SeasonKey) => `${season} ${year}`;

export const seasonKeyToValue = ({ season, year }: SeasonKey) => `${year}-${season}`;

export const parseSeasonKey = (value: string | null): SeasonKey | undefined => {
  const match = seasonValuePattern.exec(value ?? '');
  return match ? { year: Number(match[1]), season: match[2] as YearlySeasonValues } : undefined;
};

export const isSameSeason = (left: SeasonKey, right: SeasonKey) =>
  left.year === right.year && left.season === right.season;

export const getSeasonIndex = ({ season, year }: SeasonKey) => year * 4 + seasonOrder.indexOf(season);

export const shiftSeason = (key: SeasonKey, offset: number): SeasonKey => {
  const index = getSeasonIndex(key) + offset;
  return { year: Math.floor(index / 4), season: seasonOrder[((index % 4) + 4) % 4] };
};

/**
 * The first and last season index the slider moves between, stretched to take in the selected season, and the last
 * listed one, past which a season is still to be announced.
 */
export const getSeasonBounds = (seasons: SeasonSummaryType[], selected: SeasonKey) => {
  const selectedIndex = getSeasonIndex(selected);
  const oldest = minBy(seasons, item => item.key.year);
  const newest = maxBy(seasons, item => getSeasonIndex(item.key));
  const lastListed = newest ? getSeasonIndex(newest.key) : selectedIndex;
  return {
    first: Math.min(oldest ? oldest.key.year * 4 : selectedIndex, selectedIndex),
    last: Math.max(lastListed, selectedIndex),
    lastListed,
  };
};
