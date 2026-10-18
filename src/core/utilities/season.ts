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
