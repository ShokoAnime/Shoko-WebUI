import type { EpisodeCoverageType } from '@/core/types/api/release-management';

export const typeOrder: Record<string, number> = {
  Episode: 0,
  Special: 1,
  Trailer: 2,
  ThemeSong: 3,
  Credits: 4,
  Parody: 5,
  Other: 6,
};

export const typeDisplayNameMap: Record<string, string> = {
  Episode: 'Episodes',
  Special: 'Specials',
  Trailer: 'Trailers',
  ThemeSong: 'Theme Songs',
  Credits: 'Credits',
  Parody: 'Parodies',
};

const collapseToRanges = (numbers: number[]): string => {
  if (numbers.length === 0) return '';
  const sorted = [...numbers].sort((numA, numB) => numA - numB);
  const ranges: string[] = [];
  let rangeStart = sorted[0];
  let rangeEnd = sorted[0];

  for (let idx = 1; idx < sorted.length; idx += 1) {
    if (sorted[idx] === rangeEnd + 1) {
      rangeEnd = sorted[idx];
    } else {
      ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}–${rangeEnd}`);
      rangeStart = sorted[idx];
      rangeEnd = sorted[idx];
    }
  }
  ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}–${rangeEnd}`);
  return ranges.join(', ');
};

export const buildEpisodeSet = (episodes: EpisodeCoverageType[]): Set<string> =>
  new Set(episodes.map(episode => `${episode.Type}:${episode.Number}`));

export const buildEpisodeCoverageString = (episodes: EpisodeCoverageType[]): string => {
  if (episodes.length === 0) return '';

  const byType = new Map<string, number[]>();
  for (const episode of episodes) {
    if (!byType.has(episode.Type)) byType.set(episode.Type, []);
    byType.get(episode.Type)?.push(episode.Number);
  }

  const sortedTypes = [...byType.keys()].sort(
    (typeA, typeB) => (typeOrder[typeA] ?? 99) - (typeOrder[typeB] ?? 99),
  );

  return sortedTypes
    .map(type => `${typeDisplayNameMap[type] ?? type}: ${collapseToRanges(byType.get(type) ?? [])}`)
    .join('  ');
};
